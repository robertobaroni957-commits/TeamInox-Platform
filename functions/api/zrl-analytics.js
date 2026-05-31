export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_group_id = url.searchParams.get("round_group_id");
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.ZRL_DB) return new Response("DB connection lost", { status: 500 });

        if (!round_group_id || !league_key) {
            return new Response(JSON.stringify({ error: "Parametri mancanti: round_group_id e league_key necessari." }), { status: 400 });
        }

        // 1. Get the Round Group and its external_season_id
        const roundGroup = await env.ZRL_DB.prepare(`
            SELECT external_season_id FROM zrl_round_groups WHERE id = ?
        `).bind(round_group_id).first();

        if (!roundGroup) {
            return new Response(JSON.stringify({ error: "Round Group non trovato." }), { status: 404 });
        }
        const extSeasonId = roundGroup.external_season_id;

        // 2. Fetch Team Standings for this Round
        const { results: teamData } = await env.ZRL_DB.prepare(`
            SELECT * FROM zrl_team_standings 
            WHERE round_group_id = ? AND league_key = ?
            ORDER BY rank ASC
        `).bind(round_group_id, league_key).all();

        if (!teamData || teamData.length === 0) {
            return new Response(JSON.stringify({ success: true, analytics: [], mvps: [] }), { headers: { "Content-Type": "application/json" } });
        }

        // 3. Find ALL races (zrl_races table) that belong to this Round Group
        const { results: relevantRounds } = await env.ZRL_DB.prepare(`
            SELECT id as round_id, name as round_name
            FROM zrl_races
            WHERE zrl_round_group_id = ?
            ORDER BY id ASC
        `).bind(round_group_id).all();

        const roundIds = relevantRounds.map(r => r.round_id);

        // 4. Calculate Division Averages for Radar
        const avgFAL = teamData.reduce((acc, t) => acc + (t.pts_fal || 0), 0) / teamData.length;
        const avgFTS = teamData.reduce((acc, t) => acc + (t.pts_fts || 0), 0) / teamData.length;
        const avgFinish = teamData.reduce((acc, t) => acc + (t.pts_finish || 0), 0) / teamData.length;
        const maxLP = Math.max(...teamData.map(t => t.league_points || 1));

        const analytics = await Promise.all(teamData.map(async (team) => {
            // Consistency Calculation based on rank points (r1-r8)
            const races_ranks = [team.r1, team.r2, team.r3, team.r4, team.r5, team.r6, team.r7, team.r8]
                .map(r => parseInt(r))
                .filter(r => !isNaN(r) && r > 0);
            
            let consistency = 0;
            if (races_ranks.length > 1) {
                const avg = races_ranks.reduce((a, b) => a + b, 0) / races_ranks.length;
                const variance = races_ranks.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / races_ranks.length;
                consistency = Math.max(0, 100 - Math.sqrt(variance) * 10);
            } else if (races_ranks.length === 1) {
                consistency = 50;
            }

            const dna = [
                { subject: 'Sprint Killers (FTS)', A: Math.min(100, ((team.pts_fts || 0) / (avgFTS || 1)) * 50) },
                { subject: 'Attackers (FAL)', A: Math.min(100, ((team.pts_fal || 0) / (avgFAL || 1)) * 50) },
                { subject: 'Finish Masters', A: Math.min(100, ((team.pts_finish || 0) / (avgFinish || 1)) * 50) },
                { subject: 'Consistency', A: consistency },
                { subject: 'Raw Power', A: Math.min(100, ((team.league_points || 0) / maxLP) * 100) }
            ];

            let archetype = "All-Rounder";
            const topMetric = dna.reduce((prev, current) => (prev.A > current.A) ? prev : current);
            if (topMetric.A > 70) {
                if (topMetric.subject.includes('FTS')) archetype = "Pure Sprinters";
                else if (topMetric.subject.includes('FAL')) archetype = "Aggressive Attackers";
                else if (topMetric.subject.includes('Finish')) archetype = "Tactical Finishers";
                else if (topMetric.subject.includes('Consistency')) archetype = "Steady Machines";
            }

            // Fetch detailed results for points aggregation
            let rawResults = [];
            if (roundIds.length > 0) {
                const placeholders = roundIds.map(() => '?').join(',');
                const query = `
                    SELECT rider_name, zwid as zid, round_id, points_fal, points_fts, points_finish, points_total
                    FROM division_results
                    WHERE round_id IN (${placeholders})
                      AND (wtrl_team_id = ? OR (wtrl_team_id IS NULL AND team_name = ?))
                `;
                const { results } = await env.ZRL_DB.prepare(query).bind(...roundIds, team.wtrl_team_id, team.team_name).all();
                rawResults = results;
            }

            // Aggregate by rider
            const rosterMap = {};
            rawResults.forEach(row => {
                if (!rosterMap[row.rider_name]) {
                    rosterMap[row.rider_name] = {
                        rider_name: row.rider_name,
                        zid: row.zid,
                        points_total: 0,
                        pts_fal: 0,
                        pts_fts: 0,
                        pts_finish: 0,
                        race_points: {} 
                    };
                }
                const r = rosterMap[row.rider_name];
                r.points_total += row.points_total;
                r.pts_fal += row.points_fal;
                r.pts_fts += row.points_fts;
                r.pts_finish += row.points_finish;
                r.race_points[row.round_id] = (r.race_points[row.round_id] || 0) + row.points_total;
            });

            // Calculate Historical Momentum (Sum of TOTAL points per Race 1-8)
            const race_points = [0, 0, 0, 0, 0, 0, 0, 0];
            relevantRounds.forEach((rr, i) => {
                const raceMatch = rr.round_name.match(/Race\s*(\d+)/i);
                const raceIdx = raceMatch ? parseInt(raceMatch[1]) : (i + 1);
                
                const roundTotal = rawResults
                    .filter(res => res.round_id === rr.round_id)
                    .reduce((sum, res) => sum + res.points_total, 0);
                
                if (raceIdx >= 1 && raceIdx <= 8) {
                    race_points[raceIdx - 1] = roundTotal;
                }
            });

            const roster = Object.values(rosterMap).map(rider => {
                const raceBreakdown = roundIds.map(rid => rider.race_points[rid] || 0);
                return {
                    ...rider,
                    race_breakdown: raceBreakdown
                };
            }).sort((a, b) => b.points_total - a.points_total);

            return {
                team_name: team.team_name,
                rank: team.rank,
                is_inox: team.is_inox,
                archetype,
                dna,
                roster,
                stats: {
                    total_lp: team.league_points,
                    total_trp: team.total_race_points,
                    races_completed: races_ranks.length,
                    pts_fal: team.pts_fal || 0,
                    pts_fts: team.pts_fts || 0,
                    pts_finish: team.pts_finish || 0,
                    race_points: race_points
                }
            };
        }));

        return new Response(JSON.stringify({ 
            success: true, 
            analytics, 
            mvps: [] 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("Analytics API Error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

