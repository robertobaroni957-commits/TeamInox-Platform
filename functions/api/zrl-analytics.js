
export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_group_id = url.searchParams.get("round_group_id");
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        if (!round_group_id || !league_key) {
            return new Response(JSON.stringify({ error: "Parametri mancanti: round_group_id e league_key necessari." }), { status: 400 });
        }

        // 1. Recupero dati Squadre per Radar Chart
        const { results: teamData } = await env.DB.prepare(`
            SELECT * FROM zrl_team_standings 
            WHERE round_group_id = ? AND league_key = ?
            ORDER BY rank ASC
        `).bind(round_group_id, league_key).all();

        if (!teamData || teamData.length === 0) {
            return new Response(JSON.stringify({ success: true, analytics: [] }), { headers: { "Content-Type": "application/json" } });
        }

        // 2. Calcolo Medie della Divisione per Normalizzazione
        const avgFAL = teamData.reduce((acc, t) => acc + (t.pts_fal || 0), 0) / teamData.length;
        const avgFTS = teamData.reduce((acc, t) => acc + (t.pts_fts || 0), 0) / teamData.length;
        const avgFinish = teamData.reduce((acc, t) => acc + (t.pts_finish || 0), 0) / teamData.length;
        const maxLP = Math.max(...teamData.map(t => t.league_points || 1));

        const analytics = await Promise.all(teamData.map(async (team) => {
            // Calcolo Consistenza (Deviazione dai punti medi per gara)
            const races = [team.r1, team.r2, team.r3, team.r4, team.r5, team.r6]
                .map(r => parseInt(r))
                .filter(r => !isNaN(r) && r > 0);
            
            let consistency = 0;
            if (races.length > 1) {
                const avg = races.reduce((a, b) => a + b, 0) / races.length;
                const variance = races.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / races.length;
                // Più bassa la varianza, più alta la consistenza (scala 0-100)
                consistency = Math.max(0, 100 - Math.sqrt(variance) * 10);
            } else if (races.length === 1) {
                consistency = 50;
            }

            // Normalizzazione indici (0-100) rispetto alla media divisione
            const dna = [
                { subject: 'Sprint Killers (FTS)', A: Math.min(100, ((team.pts_fts || 0) / (avgFTS || 1)) * 50) },
                { subject: 'Attackers (FAL)', A: Math.min(100, ((team.pts_fal || 0) / (avgFAL || 1)) * 50) },
                { subject: 'Finish Masters', A: Math.min(100, ((team.pts_finish || 0) / (avgFinish || 1)) * 50) },
                { subject: 'Consistency', A: consistency },
                { subject: 'Raw Power', A: Math.min(100, ((team.league_points || 0) / maxLP) * 100) }
            ];

            // Identificazione Archetipo
            let archetype = "All-Rounder";
            const topMetric = dna.reduce((prev, current) => (prev.A > current.A) ? prev : current);
            if (topMetric.A > 70) {
                if (topMetric.subject.includes('FTS')) archetype = "Pure Sprinters";
                else if (topMetric.subject.includes('FAL')) archetype = "Aggressive Attackers";
                else if (topMetric.subject.includes('Finish')) archetype = "Tactical Finishers";
                else if (topMetric.subject.includes('Consistency')) archetype = "Steady Machines";
            }

            // Recupero Roster del Team per questo round group
            // Cerchiamo i round che appartengono alla serie attiva (57) E sono logicamente associati al round_group_id selezionato.
            // Il collegamento è: division_results -> rounds (round_id) -> series (series_id = 57)
            // E dobbiamo filtrare questi round per quelli associati al round_group_id selezionato.
            // L'associazione più diretta che abbiamo è tramite zrl_team_standings (che ha round_group_id)
            // Quindi, troviamo i round_id che sono nella serie attiva E che sono usati in zrl_team_standings per il round_group_id dato.
            const { results: relevantRounds } = await env.DB.prepare(`
                SELECT DISTINCT r.id AS round_id
                FROM rounds r
                JOIN series s ON r.series_id = s.id
                JOIN zrl_team_standings zts ON r.series_id = (SELECT series_id FROM zrl_round_groups WHERE id = ?) -- This is still indirect through zrl_round_groups.series_id
                WHERE s.is_active = 1 
                  AND r.series_id = ? -- Use active series ID directly (57)
                  AND zts.round_group_id = ? -- Filter by the round_group_id from frontend
            `).bind(round_group_id, activeSeriesId, round_group_id).all();

            if (!relevantRounds || relevantRounds.length === 0) {
                console.warn(`[ANALYTICS] Nessun round trovato per round_group_id: ${round_group_id} nella serie attiva ${activeSeriesId}.`);
                return { 
                    team_name: team.team_name,
                    rank: team.rank,
                    is_inox: team.is_inox,
                    archetype,
                    dna,
                    roster: [], // Empty roster
                    stats: { total_lp: team.league_points, total_trp: team.total_race_points, races_completed: 0 }
                };
            }
            const roundIds = relevantRounds.map(rr => rr.round_id);

            const { results: roster } = await env.DB.prepare(`
                SELECT dr.rider_name, dr.zwid, SUM(dr.points_total) as points_total
                FROM division_results dr
                WHERE dr.round_id IN (${roundIds.map(() => '?').join(',')}) -- Usa i round_id trovati
                  AND dr.league_key = ?
                  AND dr.team_name = ?
                GROUP BY dr.zwid, dr.rider_name
                ORDER BY points_total DESC
            `).bind(...roundIds, league_key, team.team_name).all();

            return {
                team_name: team.team_name,
                rank: team.rank,
                is_inox: team.is_inox,
                archetype,
                dna,
                roster: roster || [],
                stats: {
                    total_lp: team.league_points,
                    total_trp: team.total_race_points,
                    races_completed: races.length
                }
            };
        }));

        // 3. Recupero MVP (Top 5 Rider Inox nella divisione per punti totali)
        const { results: mvps } = await env.DB.prepare(`
            SELECT dr.rider_name, dr.team_name, SUM(dr.points_total) as points_total, 0 as position
            FROM division_results dr
            JOIN rounds r ON dr.round_id = r.id
            JOIN series s ON r.series_id = s.id
            WHERE s.is_active = 1 
              AND r.series_id = ? -- Usa la serie attiva direttamente
              AND r.id IN ( -- Filtra per round correlati al round_group_id
                  SELECT r_inner.id 
                  FROM rounds r_inner
                  JOIN zrl_round_groups rg ON r_inner.series_id = rg.series_id
                  WHERE rg.id = ? -- Filtra per il round_group_id selezionato
              )
              AND dr.league_key = ?
              AND dr.is_inox = 1
            GROUP BY dr.zwid, dr.rider_name, dr.team_name
            ORDER BY points_total DESC
            LIMIT 5
        `).bind(activeSeriesId, activeSeriesId, round_group_id, league_key).all(); // Note: activeSeriesId bound twice here if the subquery is kept, need to adjust.

        // Let's simplify the MVP query and the roster query for better clarity.
        // The issue is linking round_group_id to specific rounds.
        // Since zrl_team_standings is filtered by round_group_id and league_key,
        // we can use those to find relevant division_results IF we can find the right rounds.

        // Let's try a query that finds rounds for the active series (57) that are linked to the selected round_group_id (1)
        // and then filter division_results.
        const finalRounds = await env.DB.prepare(`
            SELECT r.id AS round_id
            FROM rounds r
            JOIN series s ON r.series_id = s.id
            WHERE s.is_active = 1
              AND r.series_id = ? -- Filter by active series ID (57)
              AND r.id IN ( -- Filter by rounds that are conceptually part of the selected round_group_id
                  SELECT r_inner.id 
                  FROM rounds r_inner
                  JOIN zrl_round_groups rg ON r_inner.series_id = rg.series_id -- This join is indirect and problematic if zrl_round_groups.series_id is wrong
                  WHERE rg.id = ? -- Filter by the round_group_id from frontend
              )
        `).bind(activeSeriesId, round_group_id).all(); // Assuming activeSeriesId is 57

        const finalRoundIds = (finalRounds.results || []).map(rr => rr.round_id);

        if (finalRoundIds.length === 0) {
             console.warn(`[ANALYTICS] No rounds found for active series ${activeSeriesId} and round_group_id ${round_group_id}.`);
             // Return empty data if no relevant rounds found
             return new Response(JSON.stringify({ success: true, analytics: [], mvps: [] }), { headers: { "Content-Type": "application/json" } });
        }

        const rosterPromises = teamData.map(async (team) => {
             // ... (dna and archetype calculation remains the same) ...
            const races = [team.r1, team.r2, team.r3, team.r4, team.r5, team.r6]
                .map(r => parseInt(r))
                .filter(r => !isNaN(r) && r > 0);
            
            let consistency = 0;
            if (races.length > 1) {
                const avg = races.reduce((a, b) => a + b, 0) / races.length;
                const variance = races.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / races.length;
                consistency = Math.max(0, 100 - Math.sqrt(variance) * 10);
            } else if (races.length === 1) {
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

            // Fetch roster points for the relevant rounds
            const rosterQuery = `
                SELECT dr.rider_name, dr.zwid, SUM(dr.points_total) as points_total
                FROM division_results dr
                WHERE dr.round_id IN (${finalRoundIds.map(() => '?').join(',')}) -- Use the found round IDs
                  AND dr.league_key = ?
                  AND dr.team_name = ?
                GROUP BY dr.zwid, dr.rider_name
                ORDER BY points_total DESC
            `;
            const { results: roster } = await env.DB.prepare(rosterQuery).bind(...finalRoundIds, league_key, team.team_name).all();

            return {
                team_name: team.team_name,
                rank: team.rank,
                is_inox: team.is_inox,
                archetype,
                dna,
                roster: roster || [],
                stats: {
                    total_lp: team.league_points,
                    total_trp: team.total_race_points,
                    races_completed: races.length
                }
            };
        });

        // 3. Recupero MVP (Top 5 Rider Inox nella divisione per punti totali)
        const mvpQuery = `
            SELECT dr.rider_name, dr.team_name, SUM(dr.points_total) as points_total, 0 as position
            FROM division_results dr
            JOIN rounds r ON dr.round_id = r.id
            WHERE r.series_id = ? -- Use active series ID (57)
              AND r.id IN (${finalRoundIds.map(() => '?').join(',')}) -- Use the found round IDs
              AND dr.league_key = ?
              AND dr.is_inox = 1
            GROUP BY dr.zwid, dr.rider_name, dr.team_name
            ORDER BY points_total DESC
            LIMIT 5
        `;
        const { results: mvps } = await env.DB.prepare(mvpQuery).bind(activeSeriesId, ...finalRoundIds, league_key).all();

        const rankedMvps = (mvps || []).map((m, i) => ({ ...m, position: i + 1 }));

        return new Response(JSON.stringify({ 
            success: true, 
            analytics: await Promise.all(analyticsPromises), // Wait for all analytics data
            mvps: rankedMvps
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("Analytics API Error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}


    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
