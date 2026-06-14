import { AiService } from './core/service-layer.js';

/**
 * Post-Race AI Auto-Generator - Phase 11.0
 * Automatically generates reports for all teams in a round.
 * Uses direct service calls to prevent deadlocks and sub-request limits.
 */

export async function onRequestPost({ request, env }) {
    const body = await request.json();
    const { round_id } = body;

    if (!round_id) {
        return new Response(JSON.stringify({ error: "Missing round_id" }), { status: 400 });
    }

    try {
        const db = env.ZRL_DB;
        if (!db) throw new Error("Database binding ZRL_DB not found");

        // 1. Identify all teams that participated in this round
        const { results: teams } = await db.prepare(`
            SELECT DISTINCT wtrl_team_id, team_name 
            FROM division_results 
            WHERE round_id = ? AND wtrl_team_id IS NOT NULL
        `).bind(round_id).all();

        if (teams.length === 0) {
            return new Response(JSON.stringify({ 
                success: true, 
                message: "No teams found for this round.",
                round_id 
            }), { status: 200 });
        }

        const stats = {
            round_id,
            total_teams: teams.length,
            generated: 0,
            cached: 0,
            failed: 0,
            processing_time_ms: 0
        };

        const startTime = Date.now();

        // 2. Batch Processing Logic
        const batchSize = 3;
        for (let i = 0; i < teams.length; i += batchSize) {
            const currentBatch = teams.slice(i, i + batchSize);

            const batchPromises = currentBatch.map(async (team) => {
                try {
                    // DIRECT SERVICE CALL: No network deadlock, no 50 sub-request limit
                    const data = await AiService.execute(env, { 
                        report_type: "race",
                        scope: {
                            round_id: parseInt(round_id), 
                            team_id: team.wtrl_team_id,
                            athlete_id: null,
                            season_code: null
                        },
                        config: { style: "journalistic", language: "it", output_format: "markdown" },
                        context: { payload: {}, minified: true, version: "11.0" },
                        caching: { strategy: "cache-first", ttl_seconds: 3600 }
                    });

                    if (data.cached) stats.cached++;
                    else stats.generated++;

                } catch (err) {
                    console.error(`[AUTO_GEN] Failed for Team ${team.team_name}: ${err.message}`);
                    stats.failed++;
                }
            });

            await Promise.all(batchPromises);
        }

        stats.processing_time_ms = Date.now() - startTime;

        return new Response(JSON.stringify({
            success: true,
            results: stats
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: "Batch generation failed", 
            message: error.message 
        }), { status: 500 });
    }
}
