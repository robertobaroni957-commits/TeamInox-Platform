export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_group_id = url.searchParams.get("round_group_id");
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        if (!round_group_id || !league_key) {
            return new Response(JSON.stringify({ error: "Parametri mancanti: round_group_id e league_key necessari." }), { status: 400 });
        }

        // 0. Recupero Serie Attiva
        const activeSeries = await env.DB.prepare("SELECT id FROM series WHERE is_active = 1").first();
        if (!activeSeries) {
            return new Response(JSON.stringify({ error: "Nessuna serie attiva trovata." }), { status: 404 });
        }
        const activeSeriesId = activeSeries.id;

        // 1. Recupero dati Squadre per Radar Chart
        const { results: teamData } = await env.DB.prepare(`
            SELECT * FROM zrl_team_standings 
            WHERE round_group_id = ? AND league_key = ?
            ORDER BY rank ASC
        `).bind(round_group_id, league_key).all();

        if (!teamData || teamData.length === 0) {
            return new Response(JSON.stringify({ success: true, analytics: [], mvps: [] }), { headers: { "Content-Type": "application/json" } });
        }

        // 2. Calcolo Medie della Divisione per Normalizzazione
        const avgFAL = teamData.reduce((acc, t) => acc + (t.pts_fal || 0), 0) / teamData.length;
        const avgFTS = teamData.reduce((acc, t) => acc + (t.pts_fts || 0), 0) / teamData.length;
        const avgFinish = teamData.reduce((acc, t) => acc + (t.pts_finish || 0), 0) / teamData.length;
        const maxLP = Math.max(...teamData.map(t => t.league_points || 1));

        // Trova i round rilevanti
        const { results: relevantRounds } = await env.DB.prepare(`
            SELECT DISTINCT dr.round_id, r.name as round_name
            FROM division_results dr
            JOIN rounds r ON dr.round_id = r.id
            WHERE dr.league_key = ? AND r.series_id = ?
            ORDER BY r.id ASC
        `).bind(league_key, activeSeriesId).all();

        const roundIds = relevantRounds.map(r => r.round_id);

        if (roundIds.length === 0) {
            const analytics = teamData.map(team => ({
                team_name: team.team_name,
                rank: team.rank,
                is_inox: team.is_inox,
                archetype: "N/A",
                dna: [],
                roster: [],
                stats: { 
                    total_lp: team.league_points, 
                    total_trp: team.total_race_points, 
                    races_completed: 0,
                    pts_fal: team.pts_fal,
                    pts_fts: team.pts_fts,
                    pts_finish: team.pts_finish,
                    race_points: [team.r1, team.r2, team.r3, team.r4, team.r5, team.r6, team.r7, team.r8]
                }
            }));
            return new Response(JSON.stringify({ success: true, analytics, mvps: [] }), { headers: { "Content-Type": "application/json" } });
        }

        const analytics = await Promise.all(teamData.map(async (team) => {
            // Calcolo Consistenza
            const races_stats = [team.r1, team.r2, team.r3, team.r4, team.r5, team.r6]
                .map(r => parseInt(r))
                .filter(r => !isNaN(r) && r > 0);
            
            let consistency = 0;
            if (races_stats.length > 1) {
                const avg = races_stats.reduce((a, b) => a + b, 0) / races_stats.length;
                const variance = races_stats.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / races_stats.length;
                consistency = Math.max(0, 100 - Math.sqrt(variance) * 10);
            } else if (races_stats.length === 1) {
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

            // Recuperiamo tutti i risultati dei round per questa squadra
            const { results: rawRoster } = await env.DB.prepare(`
                SELECT 
                    rider_name, 
                    round_id,
                    points_fal,
                    points_fts,
                    points_finish,
                    points_total
                FROM division_results
                WHERE round_id IN (${roundIds.map(() => '?').join(',')})
                  AND league_key = ?
                  AND team_name = ?
            `).bind(...roundIds, league_key, team.team_name).all();

            // Aggreghiamo i dati per rider_name
            const rosterMap = {};
            rawRoster.forEach(row => {
                if (!rosterMap[row.rider_name]) {
                    rosterMap[row.rider_name] = {
                        rider_name: row.rider_name,
                        points_total: 0,
                        pts_fal: 0,
                        pts_fts: 0,
                        pts_finish: 0,
                        race_points: {} // Mappa round_id -> punti
                    };
                }
                const r = rosterMap[row.rider_name];
                r.points_total += row.points_total;
                r.pts_fal += row.points_fal;
                r.pts_fts += row.points_fts;
                r.pts_finish += row.points_finish;
                r.race_points[row.round_id] = row.points_total;
            });

            // Trasformiamo in array e ordiniamo
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
                    races_completed: races_stats.length,
                    pts_fal: team.pts_fal,
                    pts_fts: team.pts_fts,
                    pts_finish: team.pts_finish,
                    race_points: [team.r1, team.r2, team.r3, team.r4, team.r5, team.r6, team.r7, team.r8]
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
