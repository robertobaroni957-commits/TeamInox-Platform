// functions/api/mutation/execute.js

const MUTATION_HANDLERS = {
    "ROUND_ACTIVATE": { required: ["roundId"] },
    "ROUND_ARCHIVE": { required: ["roundId"] },
    "ROUND_RESET": { required: ["roundId"] },
    "ROUND_WIPE": { required: ["roundId"] },
    "TEAM_SYNC": { required: ["roundId"] },
    "RACE_IMPORT": { required: ["roundId"] },
    "RESULTS_SYNC": { required: ["roundId"] },
    "METADATA_SYNC": { required: ["roundId"] }
};

export async function onRequestPost({ request, env }) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };

    try {
        const body = await request.json();
        const { type, payload } = body;

        // 1. Validate Mutation Type
        if (!MUTATION_HANDLERS.hasOwnProperty(type)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "UNKNOWN_MUTATION_TYPE", 
                type,
                available: Object.keys(MUTATION_HANDLERS)
            }), { status: 400, headers: corsHeaders });
        }

        // 2. Validate Payload
        const required = MUTATION_HANDLERS[type].required;
        const missing = required.filter(field => !payload || payload[field] === undefined);
        
        if (missing.length > 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "INVALID_PAYLOAD", 
                required: missing 
            }), { status: 400, headers: corsHeaders });
        }

        // 3. Execution Logic
        console.log(`[MUTATION] Executing: ${type}`, payload);
        
        return new Response(JSON.stringify({ success: true, type, status: "COMMITTED" }), { headers: corsHeaders });

    } catch (err) {
        console.error(`[MUTATION ERROR]`, err);
        return new Response(JSON.stringify({ success: false, error: "INTERNAL_SERVER_ERROR" }), { status: 500, headers: corsHeaders });
    }
}
