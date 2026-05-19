export async function onRequestGet(context) {
    const { env, data } = context;
    const traceId = data?.traceId || crypto.randomUUID();
    
    // Log di diagnostica
    console.log(`[teams] handler start. traceId: ${traceId}`);

    if (!env.ZRL_DB) {
        return new Response(JSON.stringify({ success: false, error: "Database not configured", traceId }), { status: 500 });
    }

    try {
        // Query semplificata per compatibilità schema attuale (senza season_id)
        const sql = "SELECT * FROM teams ORDER BY name ASC";
        const results = await env.ZRL_DB.prepare(sql).all();
        
        return new Response(JSON.stringify({
            success: true,
            data: results.results || [],
            traceId
        }), { 
            headers: { 'Content-Type': 'application/json' } 
        });
        
    } catch (err) {
        console.error(`[teams] Critical failure:`, err);
        return new Response(JSON.stringify({
            success: false,
            error: err.message,
            traceId
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
