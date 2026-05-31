export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.ZRL_DB) return new Response("DB connection lost", { status: 500 });

        // 1. Fetch ALL available leagues for the selector
        const { results: leagues } = await env.ZRL_DB.prepare(`
            SELECT DISTINCT 
                league_key, 
                GROUP_CONCAT(DISTINCT league_name) as league_display_name,
                MAX(is_inox) as has_inox
            FROM zrl_team_standings
            GROUP BY league_key
            ORDER BY has_inox DESC, league_key ASC
        `).all();

        if (!league_key) {
            return new Response(JSON.stringify({ 
                success: true, 
                leagues,
                message: "Select a league to view detailed stats"
            }), { headers: { "Content-Type": "application/json" } });
        }

        // 2. Fetch results aggregated by team and round
        const { results: rawResults } = await env.ZRL_DB.prepare(`
            SELECT 
                dr.team_name, 
                dr.is_inox,
                rg.round_index,
                SUM(dr.points_finish) as pts_finish,
                SUM(dr.points_fal) as pts_fal,
                SUM(dr.points_fts) as pts_fts,
                SUM(dr.points_total) as total_points
            FROM division_results dr
            JOIN zrl_races r ON dr.round_id = r.id
            JOIN zrl_round_groups rg ON r.zrl_round_group_id = rg.id
            WHERE dr.league_key = ?
            GROUP BY dr.team_name, rg.round_index
        `).bind(league_key).all();

        // 3. Fetch Top Riders for this Division
        const { results: topRiders } = await env.ZRL_DB.prepare(`
            SELECT 
                rider_name,
                team_name,
                is_inox,
                SUM(points_total) as total_pts,
                SUM(points_fal) as total_fal,
                SUM(points_fts) as total_fts,
                SUM(points_finish) as total_finish
            FROM division_results
            WHERE league_key = ? AND rider_name IS NOT NULL
            GROUP BY rider_name, team_name
            ORDER BY total_pts DESC
            LIMIT 10
        `).bind(league_key).all();

        // 4. Fetch Team Standing Details
        const { results: standings } = await env.ZRL_DB.prepare(`
            SELECT * FROM zrl_team_standings
            WHERE league_key = ?
            ORDER BY rank ASC
        `).bind(league_key).all();

        // Process data
        const teamStatsMap = {};
        rawResults.forEach(row => {
            if (!teamStatsMap[row.team_name]) {
                teamStatsMap[row.team_name] = {
                    team_name: row.team_name,
                    is_inox: row.is_inox,
                    history: {},
                    totals: { finish: 0, fal: 0, fts: 0, total: 0 }
                };
            }
            teamStatsMap[row.team_name].history[row.round_index] = {
                pts: row.total_points,
                details: { finish: row.pts_finish, fal: row.pts_fal, fts: row.pts_fts }
            };
            teamStatsMap[row.team_name].totals.finish += row.pts_finish;
            teamStatsMap[row.team_name].totals.fal += row.pts_fal;
            teamStatsMap[row.team_name].totals.fts += row.pts_fts;
            teamStatsMap[row.team_name].totals.total += row.total_points;
        });

        // Determine Tactical Archetype for Inox teams
        const inoxPerformance = Object.values(teamStatsMap)
            .filter(t => t.is_inox === 1)
            .map(t => {
                const standing = standings.find(s => s.team_name === t.team_name);
                
                // Logic for Archetype
                const { fal, fts, finish } = t.totals;
                let archetype = "Balanced Competitor";
                if (fal > fts * 2 && fal > finish) archetype = "Aggressive Attackers (FAL Focus)";
                else if (fts > fal * 2 && fts > finish) archetype = "Pure Sprinters (FTS Focus)";
                else if (finish > fal + fts) archetype = "Tactical Finishers (Position Focus)";

                return {
                    ...t,
                    overall_rank: standing ? standing.rank : null,
                    league_points: standing ? standing.league_points : null,
                    archetype
                };
            });

        return new Response(JSON.stringify({ 
            success: true, 
            league_key,
            leagues,
            inox_performance: inoxPerformance,
            division_stats: {
                top_riders: topRiders,
                avg_round_pts: Math.round(rawResults.reduce((acc, curr) => acc + curr.total_points, 0) / (standings.length || 1)),
                total_teams: standings.length
            }
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

