export async function onRequestGet(context) {
    const { env, data } = context;
    const traceId = data?.traceId || crypto.randomUUID();
    
    // Default to a fallback if seasonId is missing to prevent crash
    const seasonId = data?.seasonId || 1; 

    console.log(`[teams] handler start. traceId: ${traceId}, seasonId: ${seasonId}`);

    try {
        if (!env.ZRL_DB) throw new Error("env.ZRL_DB is undefined");
        
        const results = await env.ZRL_DB.prepare(
            "SELECT * FROM teams WHERE season_id = ? OR season_id IS NULL ORDER BY name ASC"
        ).bind(seasonId).all();
        
        return new Response(JSON.stringify({
            success: true,
            data: results.results || [],
            traceId
        }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error(`[teams] Critical failure:`, err);
        return new Response(JSON.stringify({
            success: false,
            error: err.message,
            stack: err.stack,
            traceId
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
