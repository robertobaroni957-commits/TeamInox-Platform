// functions/api/operation.js

const VALID_ACTIONS = [
    "CREATE_SEASON",
    "INITIALIZE_ROUND",
    "IMPORT_TEAMS",
    "IMPORT_RACES",
    "GENERATE_FIXTURES",
    "SYNC_RESULTS",
    "ACTIVATE",
    "RESET",
    "ARCHIVE",
    "REOPEN",
    "WIPE",
    "SYNC_ROUNDS"
];

export async function onRequestPost({ request, env }) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const body = await request.json();
        console.log("[OPERATION IN]", body);
        const { action, payload, seasonId } = body;

        if (!action || !VALID_ACTIONS.includes(action)) {
            return new Response(JSON.stringify({ success: false, error: "INVALID_ACTION" }), { status: 400, headers: corsHeaders });
        }

        const result = await executeOperation(action, payload, seasonId, env);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
    } catch (e) {
        console.error("[OPERATION ERROR]", e);
        return new Response(JSON.stringify({ success: false, error: e.message || "INTERNAL_ERROR" }), { status: 200, headers: corsHeaders });
    }
}

async function executeOperation(action, payload, seasonId, env) {
    const timestamp = new Date().toISOString();
    
    // Check current state for all operations
    const currentState = seasonId 
        ? await env.ZRL_DB.prepare("SELECT lifecycle FROM season_state WHERE season_id = ?").bind(seasonId).first()
        : null;

    const lifecycle = currentState?.lifecycle || "BOOT";

    switch (action) {
        case "CREATE_SEASON": {
            const label = payload?.season || "2025/26";
            await env.ZRL_DB.batch([
                env.ZRL_DB.prepare("INSERT INTO zrl_seasons (name, is_active) VALUES (?, 1)").bind(label),
                env.ZRL_DB.prepare("INSERT INTO season_state (season_id, lifecycle, round, updated_at) VALUES (last_insert_rowid(), 'SEASON_CREATED', 1, ?)")
                    .bind(timestamp)
            ]);
            const season = await env.ZRL_DB.prepare("SELECT id FROM zrl_seasons ORDER BY id DESC LIMIT 1").first();
            return { success: true, seasonId: season.id, lifecycle: 'SEASON_CREATED', round: 1 };
        }

        case "INITIALIZE_ROUND": {
            // 🔥 DOMAIN GUARD: Strictly enforce ARCHIVED state for transition
            if (lifecycle !== "ARCHIVED" && lifecycle !== "SEASON_CREATED" && lifecycle !== "ROUND_INITIALIZED") {
                console.warn(`[ROUND TRANSITION BLOCKED] seasonId: ${seasonId}, lifecycle: ${lifecycle}, attempted round: ${payload?.round}`);
                return { 
                    success: false, 
                    error: "ROUND_TRANSITION_BLOCKED", 
                    reason: "CURRENT_SEASON_NOT_ARCHIVED" 
                };
            }

            const round = payload?.round ?? 1;
            await env.ZRL_DB.prepare("UPDATE season_state SET lifecycle = 'ROUND_INITIALIZED', round = ?, updated_at = ? WHERE season_id = ?")
                .bind(round, timestamp, seasonId).run();
            
            return { success: true, lifecycle: 'ROUND_INITIALIZED', round };
        }

        case "ACTIVATE": {
            await env.ZRL_DB.prepare("UPDATE zrl_seasons SET is_active = 1 WHERE id = ?").bind(seasonId).run();
            await env.ZRL_DB.prepare("UPDATE season_state SET lifecycle = 'ACTIVE', updated_at = ? WHERE season_id = ?").bind(timestamp, seasonId).run();
            return { success: true, lifecycle: "ACTIVE", timestamp };
        }

        case "RESET":
            await env.ZRL_DB.batch([
                env.ZRL_DB.prepare("UPDATE zrl_seasons SET is_active = 0 WHERE id = ?").bind(seasonId),
                env.ZRL_DB.prepare("DELETE FROM season_state WHERE season_id = ?").bind(seasonId)
            ]);
            return { success: true, lifecycle: 'BOOT' };

        default:
            return { success: false, error: "ACTION_NOT_IMPLEMENTED" };
    }
}
