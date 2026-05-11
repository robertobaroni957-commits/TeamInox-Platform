export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        // 1. Fetch detailed results to aggregate by Race and also get Round-wide totals
        const { results: rawResults } = await env.DB.prepare(`
            SELECT 
                dr.team_name, 
                dr.wtrl_team_id, 
                dr.is_inox,
                r.name as race_name,
                SUM(dr.points_finish) as pts_finish,
                SUM(dr.points_fal) as pts_fal,
                SUM(dr.points_fts) as pts_fts,
                SUM(dr.points_total) as total_points
            FROM division_results dr
            JOIN rounds r ON dr.round_id = r.id
            WHERE dr.league_key = ?
            GROUP BY dr.wtrl_team_id, dr.team_name, r.name
        `).bind(league_key).all();

        const teamStatsMap = {};

        rawResults.forEach(row => {
            const teamId = row.wtrl_team_id || row.team_name;
            if (!teamStatsMap[teamId]) {
                teamStatsMap[teamId] = {
                    team_name: row.team_name,
                    is_inox: row.is_inox,
                    history: {},
                    totals: { finish: 0, fal: 0, fts: 0, total: 0 }
                };
            }
            
            // Weekly History
            const raceMatch = row.race_name.match(/Race\s*(\d+)/i);
            const raceIdx = raceMatch ? parseInt(raceMatch[1]) : null;

            if (raceIdx && raceIdx >= 1 && raceIdx <= 4) {
                teamStatsMap[teamId].history[raceIdx] = {
                    pts: row.total_points
                };
            }

            // Round-wide Aggregates
            teamStatsMap[teamId].totals.finish += row.pts_finish || 0;
            teamStatsMap[teamId].totals.fal += row.pts_fal || 0;
            teamStatsMap[teamId].totals.fts += row.pts_fts || 0;
            teamStatsMap[teamId].totals.total += row.total_points || 0;
        });

        // 2. Fetch official Rank and points from standings (Round Level)
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
                    history: t.history,
                    totals: t.totals
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
