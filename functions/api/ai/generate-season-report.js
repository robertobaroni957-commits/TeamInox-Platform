import { AiService } from './core/service-layer.js';

export async function onRequestPost({ request, env }) {
    const body = await request.json();
    
    // 1. Determine Report Type
    const report_type = "season";

    // 2. Convert body format to Unified AI Contract
    const unifiedRequest = {
        report_type: report_type,
        scope: {
            round_id: null,
            team_id: null,
            athlete_id: null,
            season_code: body.season_code || null
        },
        config: {
            style: body.style || "epic",
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
            ttl_seconds: 86400
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
            request_sent: unifiedRequest
        }), { 
            status: error.status || 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
