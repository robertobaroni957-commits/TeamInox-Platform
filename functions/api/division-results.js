
export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_id = url.searchParams.get("round_id");
    const league_key = url.searchParams.get("league_key");
    const view = url.searchParams.get("view") || "riders"; // 'riders' o 'teams'

    try {
        if (!env.DB) return new Response("DB non trovato", { status: 500 });

        // Se non abbiamo league_key, restituiamo le opzioni disponibili
        if (!league_key) {
            const { results: options } = await env.DB.prepare(`
                SELECT DISTINCT round_id, league_key, r.name as round_name
                FROM division_results dr
                JOIN zrl_races r ON dr.round_id = r.id
                ORDER BY round_id DESC, league_key ASC
            `).all();
            
            return new Response(JSON.stringify({ success: true, options }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        let query = "";
        let params = [];

        if (view === "teams") {
            if (round_id) {
                // Classifica di Gara (Team)
                query = `
                    SELECT 
                        team_name,
                        league_key,
                        round_id,
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
                params = [round_id, league_key];
            } else {
                // Classifica Generale del Round (GC)
                query = `
                    SELECT 
                        team_name,
                        league_key,
                        SUM(points_total) as points_total,
                        COUNT(DISTINCT round_id) as rounds_played,
                        MAX(is_inox) as is_inox
                    FROM division_results
                    WHERE league_key = ?
                    GROUP BY team_name
                    ORDER BY points_total DESC
                `;
                params = [league_key];
            }
        } else {
            // Recupero classifica individuale (Default)
            query = `
                SELECT * FROM division_results 
                WHERE round_id = ? AND league_key = ?
                ORDER BY position ASC, points_total DESC
            `;
            params = [round_id, league_key];
        }

        const { results } = await env.DB.prepare(query).bind(...params).all();

        return new Response(JSON.stringify({ success: true, results, view }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
