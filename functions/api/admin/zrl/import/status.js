// @ts-check
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const seasonId = url.searchParams.get("seasonId");
    const type = url.searchParams.get("type"); 

    if (!seasonId || !type) return new Response("Missing params", { status: 400 });

    try {
        const status = await env.ZRL_DB.prepare(
            "SELECT * FROM wtrl_import_state WHERE season_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1"
        ).bind(seasonId, type).first();
        
        return new Response(JSON.stringify(status || { status: 'idle' }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
