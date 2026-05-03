
export async function onRequestPost({ request, env }) {
    const errorRes = (msg, status = 500, detail = null) => new Response(
        JSON.stringify({ success: false, error: msg, detail }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        if (!env.DB) {
            return errorRes("Configurazione Server Errata: Database Binding 'DB' non trovato.", 500);
        }

        const body = await request.json();
        const { round_id, season_id, race_number } = body;

        if (!round_id) {
            return errorRes("Parametro round_id obbligatorio.", 400);
        }

        // 1. Recuperiamo i dati del Round e della Serie
        const roundData = await env.DB.prepare(`
            SELECT r.*, s.external_season_id 
            FROM rounds r
            JOIN series s ON r.series_id = s.id
            WHERE r.id = ?
        `).bind(round_id).first();

        if (!roundData) {
            return errorRes("Round non trovato.", 404);
        }

        const season = season_id || roundData.external_season_id || 19;
        let race = race_number;
        if (!race) {
            const match = roundData.name.match(/\d+/);
            race = match ? parseInt(match[0]) : 1;
        }

        // 2. Recuperiamo i team INOX e le loro chiavi di lega
        const teamsQuery = await env.DB.prepare(`
            SELECT DISTINCT league, category, division_number 
            FROM teams 
            WHERE (name LIKE '%INOX%' OR club_id = 'cef70cde-9149-43a2-b3ae-187643a44703')
            AND league IS NOT NULL AND league != ''
        `).all();

        const teamsResults = teamsQuery.results || [];

        if (teamsResults.length === 0) {
            return errorRes("Nessun team INOX con dati di lega trovati nel DB.", 404);
        }

        const leagueKeys = [...new Set(teamsResults.map(t => {
            const league = t.league;
            const divLetter = t.category || 'A';
            const divNum = t.division_number || 0;
            return `${league}0${divLetter}${divNum}0`;
        }))];

        const WTRL_COOKIE = env.WTRL_COOKIE || "";
        const syncLog = [];
        const insertStmts = [];

        // Pulizia preliminare per i leagueKeys che stiamo per aggiornare
        for (const key of leagueKeys) {
            insertStmts.push(env.DB.prepare(`DELETE FROM division_results WHERE round_id = ? AND league_key = ?`).bind(round_id, key));
        }

        // 3. Interroghiamo WTRL per ogni chiave di lega
        for (const key of leagueKeys) {
            const url = `https://www.wtrl.racing/api/zrl/results/${season}/${key}/${race}`;
            
            try {
                const response = await fetch(url, {
                    headers: {
                        "accept": "application/json",
                        "cookie": WTRL_COOKIE,
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    }
                });

                if (!response.ok) {
                    syncLog.push({ key, success: false, error: `HTTP ${response.status}` });
                    continue;
                }

                const data = await response.json();
                const teamPayload = data.payload || [];
                
                let riderCount = 0;
                for (const team of teamPayload) {
                    const teamName = team.teamname || "Unknown Team";
                    const isInoxTeam = teamName.toUpperCase().includes("INOX");
                    const riders = team.a || [];

                    for (const r of riders) {
                        riderCount++;
                        // Mapping campi basato su result.json
                        const zwid = parseInt(r.zid || r.zwid || 0); // WTRL usa zid come profile id spesso
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
                            round_id, key, teamName, riderName, zwid,
                            position, time, pts_finish, pts_fal, pts_fts,
                            pts_total, isInoxTeam ? 1 : 0
                        ));
                    }
                }
                syncLog.push({ key, success: true, count: riderCount });

            } catch (err) {
                syncLog.push({ key, success: false, error: err.message });
            }
        }

        // 4. Esecuzione batch degli inserimenti in division_results
        if (insertStmts.length > 0) {
            // Dividiamo in blocchi per evitare limiti di batch se necessario, 
            // ma D1 regge bene diverse centinaia di righe.
            await env.DB.batch(insertStmts);
        }

        // 5. Aggiornamento automatico della tabella 'results' per i nostri atleti
        // Svuotiamo i risultati WTRL attuali per questo round
        await env.DB.prepare(`DELETE FROM results WHERE round_id = ? AND data_source = 'wtrl'`).bind(round_id).run();

        // Inseriamo i risultati degli atleti INOX trovati in division_results
        // Cerchiamo il match per zwid se presente (>0), altrimenti (opzionale) potremmo fare per nome ma è rischioso.
        await env.DB.prepare(`
            INSERT INTO results (round_id, zwid, time, points_total, points_finish, points_fal, points_fts, position, data_source)
            SELECT round_id, zwid, time, points_total, points_finish, points_fal, points_fts, position, 'wtrl'
            FROM division_results
            WHERE round_id = ? AND is_inox = 1 AND zwid > 0
        `).bind(round_id).run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione completata per ${leagueKeys.length} divisioni.`,
            round_id,
            season,
            race,
            log: syncLog
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return errorRes(`Errore critico: ${err.message}`, 500);
    }
}
