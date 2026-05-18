
export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_group_id = url.searchParams.get("round_group_id");
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.ZRL_DB) return new Response("Database error", { status: 500 });

        // 1. Filtri disponibili (Stagioni e Round)
        if (!league_key || !round_group_id) {
            const { results: options } = await env.ZRL_DB.prepare(`
                SELECT 
                    rg.id as round_group_id,
                    rg.description as round_name,
                    s.name as season_name,
                    ts.league_key,
                    MAX(ts.league_name) as league_display_name
                FROM zrl_team_standings ts
                JOIN zrl_round_groups rg ON ts.round_group_id = rg.id
                JOIN series s ON rg.series_id = s.id
                GROUP BY rg.id, ts.league_key
                ORDER BY s.id DESC, rg.round_index DESC
            `).all();
            
            return new Response(JSON.stringify({ success: true, options }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. Recupero Classifica SQUADRE (GC Ufficiale)
        const { results } = await env.ZRL_DB.prepare(`
            SELECT * FROM zrl_team_standings 
            WHERE round_group_id = ? AND league_key = ?
            ORDER BY rank ASC
        `).bind(round_group_id, league_key).all();

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

