export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        // 1. Fetch results aggregated by ROUND INDEX (1, 2, 3, or 4)
        // We join division_results -> rounds -> zrl_round_groups to get the correct round_index
        const { results: rawResults } = await env.DB.prepare(`
            SELECT 
                dr.team_name, 
                dr.wtrl_team_id, 
                dr.is_inox,
                rg.round_index,
                SUM(dr.points_finish) as pts_finish,
                SUM(dr.points_fal) as pts_fal,
                SUM(dr.points_fts) as pts_fts,
                SUM(dr.points_total) as total_points
            FROM division_results dr
            JOIN rounds r ON dr.round_id = r.id
            JOIN zrl_round_groups rg ON r.series_id = rg.series_id
            WHERE dr.league_key = ?
            GROUP BY dr.wtrl_team_id, dr.team_name, rg.round_index
        `).bind(league_key).all();

        const teamStatsMap = {};

        rawResults.forEach(row => {
            const teamId = row.wtrl_team_id || row.team_name;
            if (!teamStatsMap[teamId]) {
                teamStatsMap[teamId] = {
                    team_name: row.team_name,
                    is_inox: row.is_inox,
                    history: {} // Map round_index -> data
                };
            }
            
            // Map the aggregated data to the round index (1, 2, 3, or 4)
            if (row.round_index >= 1 && row.round_index <= 4) {
                teamStatsMap[teamId].history[row.round_index] = {
                    pts: row.total_points,
                    details: {
                        finish: row.pts_finish,
                        fal: row.pts_fal,
                        fts: row.pts_fts
                    }
                };
            }
        });

        // 2. Fetch current standings for the active round to show Rank/League Points
        const { results: standings } = await env.DB.prepare(`
            SELECT team_name, wtrl_team_id, rank, league_points
            FROM zrl_team_standings
            WHERE league_key = ? AND is_inox = 1
        `).bind(league_key).all();

        const finalData = Object.values(teamStatsMap)
            .filter(t => t.is_inox === 1)
            .map(t => {
                const teamId = t.wtrl_team_id || t.team_name;
                const standing = standings.find(s => (s.wtrl_team_id || s.team_name) === teamId);
                return {
                    team_name: t.team_name,
                    overall_rank: standing ? standing.rank : null,
                    league_points: standing ? standing.league_points : null,
                    history: t.history
                };
            });

        return new Response(JSON.stringify({ 
            success: true, 
            league_key,
            inox_performance: finalData
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
