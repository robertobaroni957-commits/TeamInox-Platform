
export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_id = url.searchParams.get("round_id");
    const league_key = url.searchParams.get("league_key");
    const view = url.searchParams.get("view") || "riders"; // 'riders' o 'teams'

    try {
        if (!env.DB) return new Response("Database error", { status: 500 });

        // Recupero opzioni di filtro (basato su dati esistenti)
        if (!league_key || !round_id) {
            const { results: options } = await env.DB.prepare(`
                SELECT DISTINCT dr.round_id, dr.league_key, r.name as round_name, s.name as season_name
                FROM division_results dr
                JOIN zrl_races r ON dr.round_id = r.id
                JOIN zrl_seasons s ON r.series_id = s.id
                ORDER BY dr.round_id DESC, dr.league_key ASC
            `).all();
            
            return new Response(JSON.stringify({ success: true, options }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        let query = "";
        let params = [round_id, league_key];

        if (view === "teams") {
            // Aggregazione per squadra
            query = `
                SELECT 
                    team_name,
                    league_key,
                    SUM(points_finish) as points_finish,
                    SUM(points_fal) as points_fal,
                    SUM(points_fts) as points_fts,
                    SUM(points_total) as points_total,
                    COUNT(*) as riders_count,
                    MAX(is_inox) as is_inox
                FROM division_results
                WHERE round_id = ? AND league_key = ?
                GROUP BY team_name
                ORDER BY points_total DESC
            `;
        } else {
            // Classifica individuale
            query = `
                SELECT * FROM division_results 
                WHERE round_id = ? AND league_key = ?
                ORDER BY position ASC, points_total DESC
            `;
        }

        const { results } = await env.DB.prepare(query).bind(...params).all();

        return new Response(JSON.stringify({ success: true, results, view }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
