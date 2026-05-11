export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        // Query zrl_team_standings joined with zrl_round_groups to get round_index
        const { results: standings } = await env.DB.prepare(`
            SELECT 
                s.team_name, 
                s.wtrl_team_id, 
                s.rank, 
                s.league_points, 
                s.is_inox,
                g.round_index
            FROM zrl_team_standings s
            JOIN zrl_round_groups g ON s.round_group_id = g.id
            WHERE s.league_key = ?
            ORDER BY g.round_index ASC
        `).bind(league_key).all();

        // Group by team identifier (prefer wtrl_team_id, fallback to team_name)
        const teamStatsMap = {};

        standings.forEach(row => {
            const teamId = row.wtrl_team_id || row.team_name;
            if (!teamStatsMap[teamId]) {
                teamStatsMap[teamId] = {
                    team_name: row.team_name,
                    wtrl_team_id: row.wtrl_team_id,
                    is_inox: row.is_inox,
                    history: {}
                };
            }
            
            // Map the performance to the correct round index (1-4)
            if (row.round_index >= 1 && row.round_index <= 4) {
                teamStatsMap[teamId].history[row.round_index] = {
                    rank: row.rank,
                    pts: row.league_points
                };
            }
        });

        // Filter for Inox teams only (as requested by the UI logic usually)
        const inoxPerformance = Object.values(teamStatsMap)
            .filter(t => t.is_inox === 1)
            .map(t => ({
                team_name: t.team_name,
                history: t.history
            }));

        return new Response(JSON.stringify({ 
            success: true, 
            league_key,
            inox_performance: inoxPerformance
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
