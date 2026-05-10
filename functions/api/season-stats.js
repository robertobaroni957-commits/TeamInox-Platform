export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const season_id = url.searchParams.get("season_id") || "19";
    const league_key = url.searchParams.get("league_key");

    console.log(`Fetching season stats for Season: ${season_id}, League: ${league_key}`);

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        // 1. Fetch Team Standings
        // We look for the row with the highest round_index for each team in the league
        let teamSql = `
            SELECT ts.*, rg.round_index
            FROM zrl_team_standings ts
            JOIN zrl_round_groups rg ON ts.round_group_id = rg.id
            WHERE rg.external_season_id = ?
        `;
        const teamParams = [season_id];
        if (league_key && league_key !== 'null') {
            teamSql += ` AND ts.league_key = ?`;
            teamParams.push(league_key);
        }

        const { results: rawTeams } = await env.DB.prepare(teamSql).bind(...teamParams).all();
        console.log(`Found ${rawTeams.length} team records`);

        // Aggreghiamo per assicurarci di avere l'ultimo snapshot per squadra
        const teamsMap = {};
        rawTeams.forEach(row => {
            const key = `${row.team_name}_${row.league_key}`;
            if (!teamsMap[key] || row.round_index > teamsMap[key].round_index) {
                teamsMap[key] = row;
            }
        });

        const teamStats = Object.values(teamsMap).map(row => {
            const rounds = {};
            for (let i = 1; i <= 8; i++) {
                const lp = row[`r${i}`];
                if (lp !== null && lp !== undefined && lp !== 0) {
                    rounds[i] = {
                        lp: lp,
                        // We only have the detailed breakdown for the LATEST round in this table
                        trp: i === row.round_index ? row.total_race_points : 0,
                        fal: i === row.round_index ? row.pts_fal : 0,
                        fts: i === row.round_index ? row.pts_fts : 0,
                        fin: i === row.round_index ? row.pts_finish : 0
                    };
                }
            }

            return {
                team_name: row.team_name,
                league_key: row.league_key,
                is_inox: row.is_inox,
                total_lp: row.league_points,
                total_trp: row.total_race_points,
                total_fal: row.pts_fal,
                total_fts: row.pts_fts,
                total_finish: row.pts_finish,
                rounds
            };
        }).sort((a, b) => b.total_lp - a.total_lp || b.total_trp - a.total_trp);

        // 2. Fetch Rider Stats
        let riderSql = `
            SELECT dr.*, r.round_index
            FROM division_results dr
            JOIN rounds r ON dr.round_id = r.id
            JOIN series s ON r.series_id = s.id
            WHERE s.external_season_id = ?
        `;
        const riderParams = [season_id];
        if (league_key && league_key !== 'null') {
            riderSql += ` AND dr.league_key = ?`;
            riderParams.push(league_key);
        }

        const { results: rawRiders } = await env.DB.prepare(riderSql).bind(...riderParams).all();
        console.log(`Found ${rawRiders.length} rider records`);

        const ridersMap = {};
        rawRiders.forEach(row => {
            const zid = row.zid || row.zwid;
            if (!ridersMap[zid]) {
                ridersMap[zid] = {
                    rider_name: row.rider_name,
                    team_name: row.team_name,
                    zid: zid,
                    is_inox: row.is_inox,
                    total_points: 0,
                    total_finish: 0,
                    total_fal: 0,
                    total_fts: 0,
                    races_count: 0,
                    rounds: {}
                };
            }
            const r = ridersMap[zid];
            r.total_points += row.points_total || 0;
            r.total_finish += row.points_finish || 0;
            r.total_fal += row.points_fal || 0;
            r.total_fts += row.points_fts || 0;
            r.races_count += 1;
            r.rounds[row.round_index] = row.points_total;
        });

        const riderStats = Object.values(ridersMap).sort((a, b) => b.total_points - a.total_points);

        // 3. Highlights
        const highlights = {
            top_scorer: riderStats[0] || null,
            top_sprinter: [...riderStats].sort((a, b) => b.total_fts - a.total_fts)[0] || null,
            top_attacker: [...riderStats].sort((a, b) => b.total_fal - a.total_fal)[0] || null,
            most_consistent: [...riderStats].sort((a, b) => b.races_count - a.races_count)[0] || null,
        };

        return new Response(JSON.stringify({ 
            success: true, 
            season_id,
            league_key,
            teams: teamStats,
            riders: riderStats,
            highlights
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("Season Stats API Error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
