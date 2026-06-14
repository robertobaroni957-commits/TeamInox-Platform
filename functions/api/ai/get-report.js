import { AiCacheManager } from './core/cache-manager.js';

/**
 * AI Report Retrieval Engine - Phase 13.0
 * Unified endpoint to fetch existing reports from D1 cache.
 * Supports race, round, and season report types.
 */

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_id = url.searchParams.get("round_id");
    const team_id = url.searchParams.get("team_id");
    const season_code = url.searchParams.get("season_code");
    const report_type = url.searchParams.get("report_type") || "race";

    // 1. Validation Logic per scope
    if (report_type === 'race' && (!round_id || !team_id)) {
        return new Response(JSON.stringify({ 
            error: "Missing parameters", 
            required: ["round_id", "team_id"] 
        }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (report_type === 'round' && !round_id) {
        return new Response(JSON.stringify({ 
            error: "Missing parameters", 
            required: ["round_id"] 
        }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (report_type === 'season' && !season_code) {
        return new Response(JSON.stringify({ 
            error: "Missing parameters", 
            required: ["season_code"] 
        }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const db = env.ZRL_DB;
        if (!db) throw new Error("Database binding ZRL_DB not found");

        const cache = new AiCacheManager(db);

        // 2. UNIFIED LOOKUP: Compute hash based on provided scope
        const contract = {
            report_type,
            scope: {
                round_id: round_id ? Number(round_id) : null,
                team_id: team_id ? Number(team_id) : null,
                athlete_id: null,
                season_code: season_code || null
            },
            context: { version: "11.0" } // Target orchestrator version
        };

        const hash = await cache.computeHash(contract);
        const cacheResult = await cache.get(hash);

        if (cacheResult && cacheResult.hit) {
            let parsedReport = cacheResult.data.report;
            try {
                // Attempt to parse if it's a JSON string
                if (typeof parsedReport === 'string' && (parsedReport.trim().startsWith('{') || parsedReport.trim().startsWith('['))) {
                    const clean = parsedReport.split('<!-- AI_METADATA')[0].trim();
                    parsedReport = JSON.parse(clean);
                }
            } catch (e) {
                // Keep as string if parsing fails
            }

            return new Response(JSON.stringify({
                success: true,
                found: true,
                report: parsedReport,
                model: cacheResult.data.model,
                created_at: cacheResult.data.created_at,
                cached: true,
                hash: hash
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 3. LEGACY FALLBACK: Only for race reports without hash match
        if (report_type === 'race') {
            const legacyReport = await db.prepare(`
                SELECT content, model, created_at, hash
                FROM zrl_ai_reports
                WHERE round_id = ? 
                  AND team_id = ? 
                  AND report_type = 'race'
                ORDER BY created_at DESC
                LIMIT 1
            `).bind(round_id, team_id).first();

            if (legacyReport) {
                let parsedLegacy = legacyReport.content;
                try {
                    if (typeof parsedLegacy === 'string' && (parsedLegacy.trim().startsWith('{') || parsedLegacy.trim().startsWith('['))) {
                        const clean = parsedLegacy.split('<!-- AI_METADATA')[0].trim();
                        parsedLegacy = JSON.parse(clean);
                    }
                } catch (e) {}

                return new Response(JSON.stringify({
                    success: true,
                    found: true,
                    report: parsedLegacy,
                    model: legacyReport.model,
                    created_at: legacyReport.created_at,
                    hash: legacyReport.hash,
                    cached: true
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // 4. NOT FOUND
        return new Response(JSON.stringify({
            success: true,
            found: false,
            message: "No cached report found for this scope",
            scope: contract.scope
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: "Retrieval failed",
            message: error.message
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
