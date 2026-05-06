
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

        // Recuperiamo il round_id corrispondente nel nostro DB basandoci su season e race number
        const round = await env.DB.prepare(`
            SELECT r.id 
            FROM rounds r
            JOIN series s ON r.series_id = s.id
            WHERE s.external_season_id = ? AND r.name LIKE ?
            LIMIT 1
        `).bind(seasonId, `%Race ${raceNumber}%`).first();

        if (!round) {
            return errorRes(`Round per Stagione ${seasonId} Gara ${raceNumber} non trovato nel DB locale.`, 404);
        }

        const roundId = round.id;
        const insertStmts = [];
        let totalRiders = 0;

        for (const div of divisions) {
            const leagueKey = div.league_key;
            
            // Pulizia preventiva per questa divisione in questo round
            insertStmts.push(env.DB.prepare(`DELETE FROM division_results WHERE round_id = ? AND league_key = ?`).bind(roundId, leagueKey));

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
                        roundId, leagueKey, teamName, riderName, zwid,
                        position, time, pts_finish, pts_fal, pts_fts,
                        pts_total, isInoxTeam ? 1 : 0
                    ));
                }
            }
        }

        if (insertStmts.length > 0) {
            await env.DB.batch(insertStmts);
        }

        // Aggiornamento automatico della tabella 'results' per i nostri atleti
        // Usiamo una JOIN con la tabella athletes per evitare errori di Foreign Key se un atleta non è in anagrafica
        await env.DB.prepare(`DELETE FROM results WHERE round_id = ? AND data_source = 'wtrl'`).bind(roundId).run();
        await env.DB.prepare(`
            INSERT INTO results (round_id, zwid, time, points_total, points_finish, points_fal, points_fts, position, data_source)
            SELECT dr.round_id, dr.zwid, dr.time, dr.points_total, dr.points_finish, dr.points_fal, dr.points_fts, dr.position, 'wtrl'
            FROM division_results dr
            INNER JOIN athletes a ON dr.zwid = a.zwid
            WHERE dr.round_id = ? AND dr.is_inox = 1 AND dr.zwid > 0
        `).bind(roundId).run();

        return new Response(JSON.stringify({ 
            success: true, 
            count: totalRiders,
            message: `Importati risultati per ${totalRiders} atleti in ${divisions.length} divisioni.`
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return errorRes(err.message, 500);
    }
}
