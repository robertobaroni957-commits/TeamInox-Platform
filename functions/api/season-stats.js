export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const season_id = url.searchParams.get("season_id") || "19"; // Default to current season if not provided

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        // 1. Team Season Standings
        // Aggreghiamo i punti lega e gara attraverso tutti i Round Groups della stagione
        const { results: teamStats } = await env.DB.prepare(`
            SELECT 
                team_name,
                league_key,
                SUM(league_points) as total_lp,
                SUM(total_race_points) as total_trp,
                SUM(pts_fal) as total_fal,
                SUM(pts_fts) as total_fts,
                SUM(pts_finish) as total_finish,
                MAX(is_inox) as is_inox,
                COUNT(DISTINCT round_group_id) as segments_completed
            FROM zrl_team_standings
            WHERE round_group_id IN (
                SELECT id FROM zrl_round_groups WHERE external_season_id = ?
            )
            GROUP BY team_name, league_key
            ORDER BY total_lp DESC, total_trp DESC
        `).bind(season_id).all();

        // 2. Rider Season Performance Index
        // Utilizziamo 'zid' per l'identificazione univoca attraverso i round
        const { results: riderStats } = await env.DB.prepare(`
            SELECT 
                dr.rider_name,
                dr.team_name,
                dr.zid,
                SUM(dr.points_total) as total_points,
                SUM(dr.points_finish) as total_finish,
                SUM(dr.points_fal) as total_fal,
                SUM(dr.points_fts) as total_fts,
                COUNT(DISTINCT dr.round_id) as races_count,
                MAX(dr.is_inox) as is_inox
            FROM division_results dr
            JOIN rounds r ON dr.round_id = r.id
            JOIN series s ON r.series_id = s.id
            WHERE s.external_season_id = ?
            GROUP BY dr.zid
            ORDER BY total_points DESC
        `).bind(season_id).all();

        // 3. Season Highlights (Top Performers)
        const highlights = {
            top_scorer: riderStats[0] || null,
            top_sprinter: [...riderStats].sort((a, b) => b.total_fts - a.total_fts)[0] || null,
            top_attacker: [...riderStats].sort((a, b) => b.total_fal - a.total_fal)[0] || null,
            most_consistent: [...riderStats].sort((a, b) => b.races_count - a.races_count)[0] || null,
        };

        return new Response(JSON.stringify({ 
            success: true, 
            season_id,
            teams: teamStats,
            riders: riderStats,
            highlights
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("Season Stats API Error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
