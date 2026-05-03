
export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_id = url.searchParams.get("round_id");
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.DB) return new Response("DB non trovato", { status: 500 });

        // Se non abbiamo round_id o league_key, restituiamo le opzioni disponibili
        if (!round_id || !league_key) {
            const { results: options } = await env.DB.prepare(`
                SELECT DISTINCT round_id, league_key, r.name as round_name
                FROM division_results dr
                JOIN rounds r ON dr.round_id = r.id
                ORDER BY round_id DESC, league_key ASC
            `).all();
            
            return new Response(JSON.stringify({ success: true, options }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Recupero classifica completa
        const { results } = await env.DB.prepare(`
            SELECT * FROM division_results 
            WHERE round_id = ? AND league_key = ?
            ORDER BY position ASC, points_total DESC
        `).bind(round_id, league_key).all();

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
