import { validateAndNormalize, contractErrorResponse, validateReportStructure } from './core/contract-gate.js';
import { validateSemanticIntegrity } from './core/semantic-validator.js';
import { AiCacheManager } from './core/cache-manager.js';
import { getRaceContext, getRoundContext, getSeasonContext } from './core/data-engines.js';
import { scoreReport, embedMetadata, PROMPT_VARIANTS } from './utils/quality-engine.js';
import { minifyContext, shouldGenerate, estimateCost } from './utils/cost-optimizer.js';
import { enqueuePublishJob } from './core/publish-queue.js';
import { safeContextBuilder } from './utils/security.js';
import { generatePrompt } from '../../../services/ai/prompt-system/prompt-orchestrator.js';
import { getContractFallback } from '../../../services/ai/prompt-system/narrative-contract.js';

/**
 * AI Unified Orchestrator - Phase 13.0 (Strict Integrity)
 * Enforces data-grounded narratives and strict JSON output.
 */

const REPORT_STRATEGIES = {
    race: {
        engine: getRaceContext,
        promptKey: 'journalistic'
    },
    season: {
        engine: getSeasonContext,
        promptKey: 'epic'
    },
    round: {
        engine: getRoundContext, 
        promptKey: 'analytical'
    }
};

async function callAI(env, systemPrompt, data, previousAttempt = null) {
    if (!env.AI) {
        throw new Error("Cloudflare AI binding (env.AI) not found. Check wrangler.toml.");
    }

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `DATA: ${JSON.stringify(data)}` }
    ];

    if (previousAttempt) {
        messages.push({ role: "assistant", content: previousAttempt.content });
        messages.push({ role: "user", content: "Migliora l'analisi integrando più statistiche e nomi dei rider. Assicurati che il formato sia puramente JSON." });
    }

    try {
        const result = await env.AI.run(
            "@cf/meta/llama-3.1-8b-instruct",
            { messages }
        );

        if (!result) {
            throw new Error("Cloudflare AI returned an empty response.");
        }

        let rawResponse = result.response || result.content || "";
        
        // --- ROBUST JSON EXTRACTION ---
        const firstBrace = rawResponse.indexOf('{');
        const lastBrace = rawResponse.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            rawResponse = rawResponse.substring(firstBrace, lastBrace + 1);
        }

        return rawResponse;
    } catch (e) {
        console.error("[AI ERROR] env.AI.run failed:", e);
        throw new Error(`Cloudflare AI Error: ${e.message}`);
    }
}

async function repairJSON(env, malformedText) {
    const repairPrompt = `You are a JSON repair engine for a sports platform.
TASK: Convert input into STRICT valid JSON following this schema:
{
  "type": "race | round | season",
  "title": "string",
  "content": "string",
  "highlights": ["string"],
  "team_analysis": "string",
  "mvp": "string",
  "meta": { "tone": "motivational", "platforms": ["discord", "instagram", "facebook"] }
}
RULES: Output ONLY JSON. No markdown, no asterisks, no explanation.`;
    
    try {
        const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
            messages: [
                { role: "system", content: repairPrompt },
                { role: "user", content: `INPUT: ${malformedText}` }
            ]
        });
        let response = result.response || result.content || "";
        const first = response.indexOf('{');
        const last = response.lastIndexOf('}');
        if (first !== -1 && last !== -1) return response.substring(first, last + 1);
        return response;
    } catch (e) {
        return malformedText;
    }
}

export async function onRequestPost({ request, env }) {
    const startTime = Date.now();
    let hash = null;
    let cache = null;
    try {
        if (!env.ZRL_DB) {
            throw new Error("Database binding (env.ZRL_DB) not found.");
        }

        const body = await request.json();

        // 1. VALIDATION GATE
        const { valid, normalized, errors } = validateAndNormalize(body);
        if (!valid) return contractErrorResponse(errors);

        const { report_type, scope, config, context: ctxConfig, caching } = normalized;

        const strategy = REPORT_STRATEGIES[report_type];
        if (!strategy) return new Response(JSON.stringify({ error: "Report type not implemented" }), { status: 501 });

        const db = env.ZRL_DB;
        cache = new AiCacheManager(db);
        hash = caching.hash_override || await cache.computeHash(normalized);

        // 2. CACHE HIT
        const cacheResult = await cache.get(hash);
        if (cacheResult && cacheResult.hit && caching.strategy === 'cache-first') {
            return new Response(JSON.stringify({ success: true, cached: true, ...cacheResult.data }), {
                headers: { "Content-Type": "application/json", "X-AI-Origin": "D1_CACHE" }
            });
        }

        const acquireResult = await cache.lock(hash, normalized);
        if (!acquireResult) {
            return new Response(JSON.stringify({ status: "processing" }), { status: 202 });
        }

        // 3. RUN DATA ENGINE
        let contextData;
        try {
            contextData = await strategy.engine(db, 
                report_type === 'race' ? scope.round_id : scope.season_code, 
                scope.team_id
            );
        } catch (e) {
            if (hash) await cache.delete(hash);
            throw e;
        }

        // 3.1 DATA GROUNDING CHECK (FAIL FAST)
        if (contextData.status === 'EMPTY') {
            const fallback = getContractFallback(report_type, "Nessun dato reale trovato per questo evento.");
            return new Response(JSON.stringify({ success: false, data: fallback, reason: "DATA_EMPTY" }), { status: 400 });
        }

        // 4. COST & QUALITY GATES
        // ... (rest of check logic)
        const check = shouldGenerate(contextData, report_type);
        if (check.skip && caching.strategy !== 'force-refresh') {
            if (hash) await cache.delete(hash);
            return new Response(JSON.stringify({ success: false, skipped: true, reason: check.reason }));
        }

        const minifiedData = ctxConfig.minified ? minifyContext(contextData, report_type) : contextData;
        const safeData = safeContextBuilder(minifiedData);
        const costInfo = estimateCost(safeData, strategy.systemRules);

        // 5. GENERATION (STRICT MODE)
        const promptContext = { 
            ...safeData, 
            _validationLevel: contextData.status,
            _domainMode: report_type 
        };
        const finalPrompt = generatePrompt(report_type, promptContext);
        
        let parsedReport = null;
        let semanticValid = false;

        // One single attempt with high strictness, then one repair attempt if needed, but NO prose fallback
        let rawReport = await callAI(env, finalPrompt, safeData);
        
        const attemptParse = (text) => {
            try {
                const clean = text.replace(/```json\n?|\n?```/g, "").trim();
                const obj = JSON.parse(clean);
                const { valid } = validateReportStructure(obj);
                return valid ? obj : null;
            } catch (e) {
                const first = text.indexOf('{');
                const last = text.lastIndexOf('}');
                if (first !== -1 && last !== -1) {
                    try { 
                        const obj = JSON.parse(text.substring(first, last + 1));
                        const { valid } = validateReportStructure(obj);
                        return valid ? obj : null;
                    } catch (e2) { return null; }
                }
                return null;
            }
        };
        
        parsedReport = attemptParse(rawReport);

        if (!parsedReport) {
            console.log(`[AI DEBUG] Malformed JSON, attempting one-time repair...`);
            const repairedText = await repairJSON(env, rawReport);
            parsedReport = attemptParse(repairedText);
        }

        if (parsedReport) {
            const semanticCheck = await validateSemanticIntegrity(parsedReport, contextData, report_type);
            if (!semanticCheck.valid) {
                console.warn(`[AI DEBUG] Semantic violation: ${semanticCheck.reason}`);
                parsedReport = getContractFallback(report_type, `Violazione integrità: ${semanticCheck.reason}`);
            }
        } else {
            parsedReport = getContractFallback(report_type, "Errore nella generazione del formato JSON.");
        }

        let score = scoreReport(JSON.stringify(parsedReport), report_type, contextData);

        // 6. PERSIST & ASYNC PUBLISH
        const finalMetadata = { q: score, c: costInfo.costUsd, rid: normalized.request_id, v: "14.0" };
        
        // We store the STRINGIFIED version in cache for consistency
        const storageContent = JSON.stringify(parsedReport);
        await cache.store(hash, storageContent, "@cf/meta/llama-3.1-8b-instruct", normalized);

        await enqueuePublishJob(env, { hash, report_type, content: storageContent, metadata: finalMetadata });

        return new Response(JSON.stringify({
            success: true,
            report: parsedReport, // RETURN OBJECT, NOT STRING
            metadata: finalMetadata,
            quality: score,
            cost: costInfo,
            latency: `${Date.now() - startTime}ms`,
            publish_status: "enqueued"
        }), {
            headers: { "Content-Type": "application/json", "X-AI-Origin": "CLOUDFLARE_AI" }
        });

    } catch (error) {
        if (hash && cache) await cache.delete(hash);
        return new Response(JSON.stringify({ error: "System failed", message: error.message }), { status: 500 });
    }
}
