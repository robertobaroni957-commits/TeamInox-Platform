export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        // 1. Get the current active round group (index) to know what we are looking at
        // In the user's current DB, Round Group 1 is Round 4 (external_season_id 19)
        const activeRoundGroup = await env.DB.prepare(`
            SELECT id, round_index FROM zrl_round_groups WHERE is_closed = 0 LIMIT 1
        `).first();

        // 2. Fetch results and join with rounds to get the Race names (Race 1, Race 2, etc.)
        const { results: rawResults } = await env.DB.prepare(`
            SELECT 
                dr.team_name, 
                dr.wtrl_team_id, 
                dr.is_inox,
                r.name as race_name,
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
                    history: {}
                };
            }
            
            // Extract race index from name (e.g., "Race 1" -> 1)
            const raceMatch = row.race_name.match(/Race\s*(\d+)/i);
            const raceIdx = raceMatch ? parseInt(raceMatch[1]) : null;

            if (raceIdx && raceIdx >= 1 && raceIdx <= 4) {
                teamStatsMap[teamId].history[raceIdx] = {
                    pts: row.total_points
                };
            }
        });

        // For Inox teams, we also want to fetch their official Rank for the entire Round
        // This comes from zrl_team_standings
        const { results: standings } = await env.DB.prepare(`
            SELECT team_name, wtrl_team_id, rank
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
