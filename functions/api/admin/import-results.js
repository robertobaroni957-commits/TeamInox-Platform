
export async function onRequestPost({ request, env }) {
    const errorRes = (msg, status = 500) => new Response(
        JSON.stringify({ success: false, error: msg }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        if (!env.DB) return errorRes("DB connection lost", 500);

        const data = await request.json();
        
        // RILEVAMENTO TIPO FILE E REDIREZIONE INTERNA
        const isGC = (data.leagues && data.externalSeasonId) || (data.payload && data.externalSeasonId && data.leagueKey);
        
        if (isGC) {
            // Se è un file GC, lo passiamo all'endpoint dedicato (ingest-wtrl-standings)
            // Nota: in un worker non possiamo fare fetch interna facilmente verso noi stessi senza l'URL completo,
            // quindi per ora segnaliamo all'utente che il frontend ha sbagliato endpoint o gestiamo qui.
            // Ma la soluzione più pulita è che il frontend scelga l'endpoint giusto.
            // Tuttavia, per robustezza, aggiungiamo un controllo qui.
            return errorRes("Questo sembra un file di Classifica Generale (GC). Caricalo usando l'endpoint corretto o verifica il file.", 400);
        }

        let seasonId, raceNumber, divisions;

        // NORMALIZZAZIONE FORMATO
        if (data.divisions && data.seasonId && data.raceNumber) {
            // Formato Unificato (Massivo)
            seasonId = data.seasonId;
            raceNumber = data.raceNumber;
            divisions = data.divisions;
        } else if (data.args && data.payload) {
            // Formato Singolo (WTRL Native - come result.json)
            seasonId = data.args.season;
            raceNumber = data.args.race;
            divisions = [{
                league_key: data.args.class,
                payload: data.payload
            }];
        }

        if (!seasonId || !raceNumber || !divisions) {
            return errorRes("JSON malformato: mancano seasonId, raceNumber o divisions.", 400);
        }

        // 1. Trova la stagione reale
        // Cerchiamo la serie attiva che corrisponde alla seasonId (es: 19)
        const season = await env.DB.prepare(`
            SELECT id FROM series 
            WHERE external_season_id = ? 
            ORDER BY is_active DESC, id DESC 
            LIMIT 1
        `).bind(seasonId).first();

        if (!season) {
            console.error(`[IMPORT] Stagione ${seasonId} non trovata.`);
            return errorRes(`Stagione ${seasonId} non censita nel database.`, 404);
        }

        console.log(`[IMPORT] Trovata stagione ID: ${season.id} per seasonId: ${seasonId}`);

        let totalRidersImported = 0;
        const insertStmts = [];
        const affectedRaceIds = new Set();

        // Prepariamo una cache dei round per questa stagione
        const raceSearchPattern = `%Race ${raceNumber}%`;
        const { results: raceResults } = await env.DB.prepare(`
            SELECT id, name, category
            FROM rounds
            WHERE series_id = ? AND (name LIKE ? OR name LIKE ?)
        `).bind(season.id, raceSearchPattern, `%R${raceNumber}%`).all();

        const raceMap = raceResults || [];
        if (raceMap.length === 0) {
            // Debug approfondito: vediamo cosa c'è nel DB per questa stagione specifica
            const checkRaces = await env.DB.prepare("SELECT id, name, category FROM rounds WHERE series_id = ?").bind(season.id).all();
            console.error(`[IMPORT] Nessuna gara trovata per serie ${season.id}. Disponibili:`, checkRaces.results);
            
            const names = (checkRaces.results || []).map(r => `${r.name} (${r.category})`).join(", ");
            return errorRes(`Gara 'Race ${raceNumber}' non trovata per la stagione ID ${season.id}. Gare presenti: ${names || 'Nessuna'}`, 404);
        }

        for (const div of divisions) {
            const leagueKey = div.league_key;
            // Estrazione categoria (B da 2410B20)
            const catChar = leagueKey.charAt(4).toUpperCase();

            // Trova la gara corretta: 
            // 1. Cerca per categoria specifica (A, B, C...)
            // 2. Fallback su 'ALL'
            // 3. Fallback su gara che contiene la categoria nel nome
            // 4. Fallback sulla prima gara trovata per quel numero
            let targetRace = raceMap.find(r => r.category === catChar) || 
                             raceMap.find(r => r.category === 'ALL') || 
                             raceMap.find(r => r.name.includes(`Cat ${catChar}`)) ||
                             raceMap[0];

            const raceId = targetRace.id;
            affectedRaceIds.add(raceId);

            // Pulizia mirata per questa divisione
            insertStmts.push(env.DB.prepare(`DELETE FROM division_results WHERE round_id = ? AND league_key = ?`).bind(raceId, leagueKey));

            for (const team of div.payload) {
                const teamName = team.teamname || "Unknown Team";
                const isInox = teamName.toUpperCase().includes("INOX");
                const riders = team.a || [];
                
                // Stable ID detection (trc)
                // id1 in WTRL results usually corresponds to the stable Team ID (tttid)
                const tttid = team.id1 || team.tttid;
                let wtrl_team_id = null;

                // Tenta di risolvere il wtrl_team_id (trc) se abbiamo il team nel DB
                if (tttid) {
                    const knownTeam = await env.DB.prepare(`SELECT wtrl_team_id FROM teams WHERE tttid = ? OR wtrl_team_id = ?`).bind(tttid, tttid).first();
                    if (knownTeam) wtrl_team_id = knownTeam.wtrl_team_id;
                    else wtrl_team_id = tttid; // Fallback all'ID fornito
                }

                for (const r of riders) {
                    totalRidersImported++;
                    const zwid = parseInt(r.zid || r.zwid || 0);
                    const riderName = r.name || "Unknown";
                    const position = parseInt(r.p1) || null;
                    const time = parseFloat(r.timeResult) || 0;
                    
                    insertStmts.push(env.DB.prepare(`
                        INSERT INTO division_results (
                            round_id, league_key, team_name, rider_name, zwid, 
                            position, time, points_finish, points_fal, points_fts, 
                            points_total, is_inox, wtrl_team_id
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        raceId, leagueKey, teamName, riderName, zwid,
                        position, time, 
                        parseInt(r.finrp || r.finp || 0), 
                        parseInt(r.falrp || r.falp || 0), 
                        parseInt(r.ftsrp || r.ftsp || 0), 
                        parseInt(r.totrp || r.totp || 0), 
                        isInox ? 1 : 0,
                        wtrl_team_id
                    ));
                }
            }
        }

        // Esecuzione batch
        if (insertStmts.length > 0) {
            // Dividiamo in blocchi da 100 per sicurezza
            for (let i = 0; i < insertStmts.length; i += 100) {
                await env.DB.batch(insertStmts.slice(i, i + 100));
            }
        }

        // Aggiornamento tabella 'results' per gli atleti INOX (Sincronizzazione finale)
        for (const rid of affectedRaceIds) {
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
            message: `Processo completato: ${totalRidersImported} atleti caricati con successo.`,
            stats: { riders: totalRidersImported, races: affectedRaceIds.size }
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return errorRes(`Errore critico: ${err.message}`, 500);
    }
}
