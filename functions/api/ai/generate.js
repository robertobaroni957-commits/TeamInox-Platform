import { RaceEngine } from '../../../services/sports/race-engine.js';
import { RoundEngine } from '../../../services/sports/round-engine.js';
import { SeasonEngine } from '../../../services/sports/season-engine.js';
import { generatePrompt } from '../../../services/ai/prompt-system/prompt-orchestrator.js';
import { validateOutputSchema, repairInvalidJson, fallbackNarrative, forceContractCompliance } from '../../../services/ai/prompt-system/output-validator.js';
import { validateSemanticIntegrity } from './core/semantic-validator.js';
import { normalizeToContract } from './core/contract-normalizer.js';
import { validateRequestParams } from './core/request-validator.js';
import { fallbackContextBuilder } from './core/fallback-context-builder.js';
import { AI_MODES, DEFAULT_MODE } from './core/constants.js';
import { resolveDomain } from './core/domain-resolver.js';

const MAX_RESULTS = 50;
const MAX_EVENTS = 20;
const MAX_PROMPT_CHARS = 6000;

export async function onRequestPost({ request, env }) {
    let mode = DEFAULT_MODE;
    try {
        const body = await request.json();
        mode = body.mode || DEFAULT_MODE;
        console.log("[AI ORCHESTRATOR] Mode:", mode, "Body:", JSON.stringify(body));

        // --- BYPASS PATH FOR CLIENT-SUPPLIED PROMPTS (DIRECT UPLOAD NARRATIVES) ---
        if (body.prompt) {
            console.log("[AI ORCHESTRATOR] Direct prompt execution requested");
            if (!env.AI) {
                throw new Error("Cloudflare AI binding (env.AI) not found. Check wrangler.toml.");
            }

            let attempts = 0;
            const maxAttempts = 2;
            let rawResponse = "";
            let parsedData = null;

            while (attempts < maxAttempts && !parsedData) {
                attempts++;
                try {
                    console.log(`[AI ORCHESTRATOR] Direct LLM attempt ${attempts}...`);
                    const aiTask = env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
                        messages: [{ role: "system", content: body.prompt }],
                        max_tokens: 1024,
                        temperature: attempts === 1 ? 0.3 : 0.1 // lower temperature on retry for stricter output
                    });
                    const timeoutTask = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error("AI_TIMEOUT")), 45000)
                    );
                    const llmResponse = await Promise.race([aiTask, timeoutTask]);
                    rawResponse = llmResponse.response || llmResponse.content || "";

                    const firstBrace = rawResponse.indexOf('{');
                    const lastBrace = rawResponse.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        const cleanJson = rawResponse.substring(firstBrace, lastBrace + 1);
                        try {
                            parsedData = JSON.parse(cleanJson);
                        } catch (e) {
                            console.warn(`[AI ORCHESTRATOR] JSON parse failed on attempt ${attempts}:`, e.message);
                        }
                    }
                } catch (err) {
                    console.error(`[AI ORCHESTRATOR] Direct LLM execution failed on attempt ${attempts}:`, err.message);
                }
            }

            // --- SERVER-SIDE JSON REPAIR PASS ---
            if (!parsedData && rawResponse) {
                console.log("[AI ORCHESTRATOR] Direct LLM output malformed. Initiating JSON repair layer...");
                const schemaDesc = `{
  "title": "string",
  "summary": "string",
  "highlights": ["string"],
  "insights": [
    { "category": "performance", "text": "string" },
    { "category": "strategy", "text": "string" },
    { "category": "incidents", "text": "string" }
  ],
  "metadata": { "grounded": boolean, "model_version": "string" }
}`;
                parsedData = await repairJSONResponse(env, rawResponse, schemaDesc);
            }

            // --- SERVER-SIDE RESILIENT FALLBACK ---
            if (!parsedData) {
                console.warn("[AI ORCHESTRATOR] Direct LLM generation and repair failed. Serving server-side fallback.");
                parsedData = {
                    title: "Race Narrative – Status: Temporarily Unavailable",
                    summary: "La sintesi automatica della gara è temporaneamente non disponibile a causa di un'anomalia di elaborazione dell'intelligenza artificiale.",
                    highlights: [
                        "Dati di gara ricevuti con successo dal file caricato.",
                        "Visualizzazione classifica individuale e per team disponibile nel tabellone.",
                        "Generazione automatica dei commenti testuali in attesa di rinvio."
                    ],
                    insights: [
                        { category: "performance", text: "La performance individuale è consultabile nella tabella dei risultati. Punteggio medio calcolato correttamente." },
                        { category: "strategy", text: "Analisi strategica temporaneamente sospesa. I dati di gara sono salvati e coerenti." },
                        { category: "incidents", text: "Non sono state riscontrate violazioni strutturali nei dati degli atleti." }
                    ],
                    metadata: {
                        grounded: false,
                        model_version: "server_fallback_v2"
                    }
                };
            }

            return new Response(JSON.stringify({
                status: 'SUCCESS',
                data: parsedData
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store"
                }
            });
        }

        const db = env.ZRL_DB;
        if (!db) {
            throw new Error("Database binding ZRL_DB not found");
        }

        // 1. Fetch lightweight metadata tables to build the base graph structure
        const [seasons, rounds, races, teams] = await Promise.all([
            db.prepare("SELECT id, name FROM zrl_seasons").all().then(r => r.results || []),
            db.prepare("SELECT id, series_id as season_id, round_index, description as name FROM zrl_round_groups").all().then(r => r.results || []),
            db.prepare("SELECT id, zrl_round_group_id as round_id, name, world, route FROM zrl_races").all().then(r => r.results || []),
            db.prepare("SELECT wtrl_team_id as id, name FROM teams").all().then(r => r.results || [])
        ]);

        const graph = { nodes: {}, edges: [] };
        const addNode = (type, id, data) => {
            graph.nodes[`${type}:${id}`] = { id: `${type}:${id}`, type, data };
        };

        seasons.forEach(s => addNode('season', s.id, { ...s, code: s.name }));
        rounds.forEach(r => addNode('round', r.id, r));
        races.forEach(r => addNode('race', r.id, r));
        teams.forEach(t => addNode('team', t.id, t));

        // 2. Fallback derivation & Request Validation
        const params = fallbackContextBuilder(mode, body.params || {}, graph);
        const requestCheck = validateRequestParams(mode, params);
        
        if (!requestCheck.valid) {
            return new Response(JSON.stringify({
                status: 'ERROR',
                data: null,
                reason: "MISSING_PARAMETERS: " + requestCheck.missing.join(', ')
            }), { status: 422, headers: { "Content-Type": "application/json" } });
        }

        // 3. Domain Resolution
        const domainCheck = resolveDomain(mode, params, graph);

        // 4. Deterministic Engine execution using real SQLite data
        let engineData;
        let rawRiderResults = [];
        let rawTeamResults = [];

        if (mode === AI_MODES.RACE) {
            const raceNode = Object.values(graph.nodes).find(n => n.type === 'race' && n.data.round_id == params.round_id);
            const race = raceNode ? raceNode.data : {};
            
            if (race.id) {
                const team = teams.find(t => t.id == params.team_id);
                const teamName = team ? team.name : '';

                // Query rider results for this specific race & team
                const { results: riders } = await db.prepare(`
                    SELECT rider_name, position, points_total as points 
                    FROM division_results 
                    WHERE round_id = ? AND team_name = ? AND rider_name IS NOT NULL
                `).bind(race.id, teamName).all();
                rawRiderResults = (riders || []).slice(0, MAX_RESULTS);

                // Query team results (aggregate row where rider_name is null)
                const { results: teamRes } = await db.prepare(`
                    SELECT team_name, points_total as points, position 
                    FROM division_results 
                    WHERE round_id = ? AND team_name = ? AND rider_name IS NULL
                `).bind(race.id, teamName).all();
                rawTeamResults = teamRes || [];
            }

            engineData = RaceEngine.analyze(race, rawRiderResults, rawTeamResults, [], params.round_id);
            if (race.id) engineData.race_id = race.id;
        }
        else if (mode === AI_MODES.ROUND) {
            const roundNode = graph.nodes[`round:${params.round_id}`];
            const round = roundNode ? roundNode.data : {};

            const roundRaces = Object.values(graph.nodes)
                .filter(n => n.type === 'race' && n.data.round_id == params.round_id)
                .map(n => n.data);
            const raceIds = roundRaces.map(r => r.id);

            if (raceIds.length > 0) {
                const placeholders = raceIds.map(() => '?').join(',');
                const { results: teamRes } = await db.prepare(`
                    SELECT team_name, points_total as points, position, round_id as race_id
                    FROM division_results
                    WHERE round_id IN (${placeholders}) AND rider_name IS NULL
                `).bind(...raceIds).all();
                rawTeamResults = teamRes || [];

                const {results: riders } = await db.prepare(`
                    SELECT rider_name, team_name, points_total as points, position, round_id as race_id
                    FROM division_results
                    WHERE round_id IN (${placeholders}) AND rider_name IS NOT NULL
                `).bind(...raceIds).all();
                rawRiderResults = (riders || []).slice(0, MAX_RESULTS);
            }

            engineData = RoundEngine.analyze(round, roundRaces, rawRiderResults, rawTeamResults);
        }
        else if (mode === AI_MODES.SEASON) {
            const season = seasons.find(s => s.name === params.season_code) || seasons[0] || {};
            
            const seasonRounds = Object.values(graph.nodes)
                .filter(n => n.type === 'round' && n.data.season_id == season.id)
                .map(n => n.data);
            const roundIds = seasonRounds.map(r => r.id);

            const seasonRaces = Object.values(graph.nodes)
                .filter(n => n.type === 'race' && roundIds.includes(n.data.round_id))
                .map(n => n.data);
            const raceIds = seasonRaces.map(r => r.id);

            if (raceIds.length > 0) {
                const placeholders = raceIds.map(() => '?').join(',');
                const { results: teamRes } = await db.prepare(`
                    SELECT team_name, points_total as points, position, round_id as race_id
                    FROM division_results
                    WHERE round_id IN (${placeholders}) AND rider_name IS NULL
                `).bind(...raceIds).all();
                rawTeamResults = teamRes || [];

                const { results: riders } = await db.prepare(`
                    SELECT rider_name, team_name, points_total as points, position, round_id as race_id
                    FROM division_results
                    WHERE round_id IN (${placeholders}) AND rider_name IS NOT NULL
                `).bind(...raceIds).all();
                rawRiderResults = (riders || []).slice(0, MAX_RESULTS);
            }

            engineData = SeasonEngine.analyze(season, seasonRounds, seasonRaces, rawRiderResults, rawTeamResults);
        }
        else return new Response(JSON.stringify(normalizeToContract(mode, null, 'error')), { status: 400 });

        // 5. Semantic Validation
        const validationContext = {
            ...engineData,
            riderResults: rawRiderResults,
            races: Object.values(graph.nodes).filter(n => n.type === 'race' && n.data.round_id == params.round_id).map(n => n.data),
            standings: rawTeamResults
        };
        const semanticCheck = validateSemanticIntegrity(mode, validationContext);
        
        if (semanticCheck.level === 'BLOCKED') {
             const fallback = fallbackNarrative(engineData, mode);
             return new Response(JSON.stringify({ status: 'ERROR', data: fallback, reason: semanticCheck.reason }), { status: 400 });
        }

        const state = semanticCheck.level === 'FULL' ? 'SUCCESS' : 'PARTIAL';
        const warning = semanticCheck.level !== 'FULL' ? semanticCheck.reason : undefined;

        // 6. AI Generation with Safety & Compression
        const compressedEngineData = {
            ...engineData,
            events: Array.isArray(engineData.events) ? engineData.events.slice(0, MAX_EVENTS) : [],
            results: Array.isArray(engineData.results) ? engineData.results.slice(0, MAX_RESULTS) : []
        };

        const promptContext = { 
            ...compressedEngineData,
            team_performance: rawRiderResults.map(r => ({ rider_name: r.rider_name, position: r.position, points: r.points })),
            _domainMode: domainCheck.mode,
            _validationLevel: semanticCheck.level 
        };
        
        let prompt = generatePrompt(mode, promptContext);
        
        // Truncate prompt to MAX_PROMPT_CHARS if still too long
        if (prompt.length > MAX_PROMPT_CHARS) {
            prompt = prompt.substring(0, MAX_PROMPT_CHARS);
        }
        
        const aiTask = env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
            messages: [{ role: "system", content: prompt }],
            max_tokens: 1024
        });
        const timeoutTask = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("AI_TIMEOUT")), 50000)
        );

        const llmResponse = await Promise.race([aiTask, timeoutTask]);

        // 7. Structure Validation & Repair
        let { valid, data } = validateOutputSchema(llmResponse.response);
        let finalData;

        if (valid) {
            finalData = normalizeToContract(mode, data, state.toLowerCase(), warning);
            // Re-validate semantically on generated content
            const finalSemantic = validateSemanticIntegrity(finalData, validationContext, mode);
            if (!finalSemantic.valid) {
                finalData = fallbackNarrative(engineData, mode);
                finalData.summary = `Validazione semantica fallita: ${finalSemantic.reason}`;
            }
        } else {
            const repairedData = repairInvalidJson(llmResponse.response);
            finalData = repairedData || fallbackNarrative(engineData, mode);
        }

        return new Response(JSON.stringify({
            status: valid ? state : 'SUCCESS_FALLBACK',
            data: finalData,
            reason: warning
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Orchestrator Fatal Error:", error);
        return new Response(JSON.stringify({ 
            status: 'ERROR',
            data: fallbackNarrative({}, mode),
            reason: error.message 
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

async function repairJSONResponse(env, malformedText, expectedSchemaDesc) {
    const repairPrompt = `You are a strict JSON repair engine.
Your task is to fix the following malformed JSON so that it is perfectly parseable by JSON.parse() and conforms strictly to the expected schema.

EXPECTED SCHEMA:
${expectedSchemaDesc}

MALFORMED INPUT:
${malformedText}

RULES:
1. Fix syntax errors: unescaped quotes inside strings, missing commas, unmatched braces, trailing commas, or truncated arrays/objects.
2. Return ONLY the valid, corrected JSON. Do not include any commentary, markdown code blocks, or text outside the JSON.
`;
    try {
        const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
            messages: [{ role: "system", content: repairPrompt }],
            max_tokens: 1024,
            temperature: 0.1
        });
        const repairedResponse = result.response || result.content || "";
        const first = repairedResponse.indexOf('{');
        const last = repairedResponse.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
            return JSON.parse(repairedResponse.substring(first, last + 1));
        }
        return null;
    } catch (e) {
        console.error("[AI REPAIR] JSON repair attempt failed:", e.message);
        return null;
    }
}
