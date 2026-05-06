
export async function onRequestPost({ request, env }) {
    const errorRes = (msg, status = 500) => new Response(
        JSON.stringify({ success: false, error: msg }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        if (!env.DB) return errorRes("Database binding not found", 500);

        const data = await request.json();
        const { seasonId, raceNumber, divisions } = data;

        if (!seasonId || !raceNumber || !divisions) {
            return errorRes("Dati non completi nel JSON unificato.", 400);
        }

        // 1. Recuperiamo la stagione (series)
        const season = await env.DB.prepare(`
            SELECT id FROM zrl_seasons WHERE external_season_id = ? LIMIT 1
        `).bind(seasonId).first();

        if (!season) {
            return errorRes(`Stagione con ID WTRL ${seasonId} non trovata nel sistema.`, 404);
        }

        const season_id = season.id;
        const insertStmts = [];
        let totalRiders = 0;
        const processedRounds = new Set();

        for (const div of divisions) {
            const leagueKey = div.league_key;
            
            // Estraiamo la categoria dalla league_key (es: 2410B20 -> B)
            // Di solito è il 5° carattere (indice 4)
            let category = leagueKey.charAt(4).toUpperCase();
            if (!['A', 'B', 'C', 'D'].includes(category)) category = 'ALL';

            // 2. Troviamo la gara (race) specifica per questa categoria
            const race = await env.DB.prepare(`
                SELECT id FROM zrl_races 
                WHERE series_id = ? 
                AND name LIKE ? 
                AND (category = ? OR category = 'ALL')
                ORDER BY (category = ?) DESC
                LIMIT 1
            `).bind(season_id, `%Race ${raceNumber}%`, category, category).first();

            if (!race) {
                console.warn(`Gara non trovata per Categoria ${category}, Race ${raceNumber}. Salto divisione ${leagueKey}.`);
                continue;
            }

            const raceId = race.id;

            // Pulizia preventiva per questa divisione in questo specifico round/gara
            insertStmts.push(env.DB.prepare(`DELETE FROM division_results WHERE round_id = ? AND league_key = ?`).bind(raceId, leagueKey));
            processedRounds.add(raceId);

            for (const team of div.payload) {
                const teamName = team.teamname || "Unknown Team";
                const isInoxTeam = teamName.toUpperCase().includes("INOX");
                const riders = team.a || [];

                for (const r of riders) {
                    totalRiders++;
                    const zwid = parseInt(r.zid || r.zwid || 0);
                    const riderName = r.name || "Unknown Rider";
                    const position = parseInt(r.p1) || null;
                    const time = parseFloat(r.timeResult) || 0;
                    const pts_finish = parseInt(r.finrp) || 0;
                    const pts_fal = parseInt(r.falrp) || 0;
                    const pts_fts = parseInt(r.ftsrp) || 0;
                    const pts_total = parseInt(r.totrp) || 0;

                    insertStmts.push(env.DB.prepare(`
                        INSERT INTO division_results (
                            round_id, league_key, team_name, rider_name, zwid, 
                            position, time, points_finish, points_fal, points_fts, 
                            points_total, is_inox
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        raceId, leagueKey, teamName, riderName, zwid,
                        position, time, pts_finish, pts_fal, pts_fts,
                        pts_total, isInoxTeam ? 1 : 0
                    ));
                }
            }
        }

        if (insertStmts.length > 0) {
            await env.DB.batch(insertStmts);
        }

        // 3. Aggiornamento tabella 'results' (solo per atleti INOX anagrafati)
        for (const rid of processedRounds) {
            await env.DB.prepare(`DELETE FROM results WHERE round_id = ? AND data_source = 'wtrl'`).bind(rid).run();
            await env.DB.prepare(`
                INSERT INTO results (round_id, zwid, time, points_total, points_finish, points_fal, points_fts, position, data_source)
                SELECT dr.round_id, dr.zwid, dr.time, dr.points_total, dr.points_finish, dr.points_fal, dr.points_fts, dr.position, 'wtrl'
                FROM division_results dr
                INNER JOIN athletes a ON dr.zwid = a.zwid
                WHERE dr.round_id = ? AND dr.is_inox = 1 AND dr.zwid > 0
            `).bind(rid).run();
        }

        return new Response(JSON.stringify({ 
            success: true, 
            count: totalRiders,
            message: `Importati risultati per ${totalRiders} atleti in ${divisions.length} divisioni, distribuiti su ${processedRounds.size} gare per categoria.`
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return errorRes(err.message, 500);
    }
}
