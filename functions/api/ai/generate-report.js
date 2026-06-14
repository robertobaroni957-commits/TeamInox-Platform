import { AiService } from './core/service-layer.js';

export async function onRequestPost({ request, env }) {
    const body = await request.json();
    
    // 1. Determine Report Type (race or round)
    const report_type = body.report_type || "race";

    // 2. Convert old body format to Unified AI Contract
    const unifiedRequest = {
        report_type: report_type,
        scope: {
            round_id: body.round_id ? Number(body.round_id) : null,
            team_id: body.team_id ? Number(body.team_id) : (report_type === 'round' ? 0 : null),
            athlete_id: null,
            season_code: body.season_code || null
        },
        config: {
            style: body.style || (report_type === 'round' ? "analytical" : "journalistic"),
            language: "it",
            output_format: "markdown"
        },
        context: {
            payload: {},
            minified: true,
            version: "11.0"
        },
        caching: {
            strategy: body.force ? "force-refresh" : "cache-first",
            ttl_seconds: 3600
        }
    };

    // DIRECT CALL: Prevents single-threaded deadlock in dev
    try {
        const result = await AiService.execute(env, unifiedRequest);
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: error.message,
            details: error.details,
            request_sent: unifiedRequest // Debugging help
        }), { 
            status: error.status || 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
