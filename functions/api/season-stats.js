export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const season_id = url.searchParams.get("season_id") || "19";

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        // 1. Team Season Standings with Round Breakdown
        // Preleviamo i risultati round per round per le squadre
        const { results: rawTeamStats } = await env.DB.prepare(`
            SELECT 
                ts.team_name,
                ts.league_key,
                rg.round_index,
                ts.league_points,
                ts.total_race_points,
                ts.pts_fal,
                ts.pts_fts,
                ts.pts_finish,
                ts.is_inox
            FROM zrl_team_standings ts
            JOIN zrl_round_groups rg ON ts.round_group_id = rg.id
            WHERE rg.external_season_id = ?
            ORDER BY ts.team_name, rg.round_index ASC
        `).bind(season_id).all();

        // Aggreghiamo i dati per squadra
        const teamsMap = {};
        rawTeamStats.forEach(row => {
            if (!teamsMap[row.team_name]) {
                teamsMap[row.team_name] = {
                    team_name: row.team_name,
                    league_key: row.league_key,
                    is_inox: row.is_inox,
                    total_lp: 0,
                    total_trp: 0,
                    total_fal: 0,
                    total_fts: 0,
                    total_finish: 0,
                    rounds: {} // Breakdown per round
                };
            }
            const t = teamsMap[row.team_name];
            t.total_lp += row.league_points || 0;
            t.total_trp += row.total_race_points || 0;
            t.total_fal += row.pts_fal || 0;
            t.total_fts += row.pts_fts || 0;
            t.total_finish += row.pts_finish || 0;
            
            t.rounds[row.round_index] = {
                lp: row.league_points,
                trp: row.total_race_points,
                fal: row.pts_fal,
                fts: row.pts_fts,
                fin: row.pts_finish
            };
        });

        const teamStats = Object.values(teamsMap).sort((a, b) => b.total_lp - a.total_lp || b.total_trp - a.total_trp);

        // 2. Rider Season Performance with Round Breakdown
        const { results: rawRiderStats } = await env.DB.prepare(`
            SELECT 
                dr.rider_name,
                dr.team_name,
                dr.zid,
                r.round_index,
                dr.points_total,
                dr.points_finish,
                dr.points_fal,
                dr.points_fts,
                dr.is_inox
            FROM division_results dr
            JOIN rounds r ON dr.round_id = r.id
            JOIN series s ON r.series_id = s.id
            WHERE s.external_season_id = ?
            ORDER BY dr.zid, r.round_index ASC
        `).bind(season_id).all();

        const ridersMap = {};
        rawRiderStats.forEach(row => {
            if (!ridersMap[row.zid]) {
                ridersMap[row.zid] = {
                    rider_name: row.rider_name,
                    team_name: row.team_name,
                    zid: row.zid,
                    is_inox: row.is_inox,
                    total_points: 0,
                    total_finish: 0,
                    total_fal: 0,
                    total_fts: 0,
                    races_count: 0,
                    rounds: {}
                };
            }
            const r = ridersMap[row.zid];
            r.total_points += row.points_total || 0;
            r.total_finish += row.points_finish || 0;
            r.total_fal += row.points_fal || 0;
            r.total_fts += row.points_fts || 0;
            r.races_count += 1;
            
            r.rounds[row.round_index] = row.points_total;
        });

        const riderStats = Object.values(ridersMap).sort((a, b) => b.total_points - a.total_points);

        // 3. Season Highlights
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
