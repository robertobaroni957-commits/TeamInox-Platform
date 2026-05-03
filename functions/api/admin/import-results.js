
export async function onRequestPost({ request, env }) {
    const errorRes = (msg, status = 500, detail = null) => new Response(
        JSON.stringify({ success: false, error: msg, detail }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        if (!env.DB) {
            return errorRes("Configurazione Database non trovata.", 500);
        }

        // 0. Auto-riparazione: Assicuriamoci che la tabella esista
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS division_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                round_id INTEGER NOT NULL,
                league_key TEXT NOT NULL,
                team_name TEXT,
                rider_name TEXT,
                zwid INTEGER, 
                position INTEGER,
                time REAL,
                points_finish INTEGER DEFAULT 0,
                points_fal INTEGER DEFAULT 0,
                points_fts INTEGER DEFAULT 0,
                points_total INTEGER DEFAULT 0,
                is_inox BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();
        
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_div_res_round_key ON division_results(round_id, league_key)`).run();

        // 0b. Auto-riparazione: Assicuriamoci che la tabella results abbia le colonne di dettaglio
        try { await env.DB.prepare(`ALTER TABLE results ADD COLUMN points_finish INTEGER DEFAULT 0`).run(); } catch(e){}
        try { await env.DB.prepare(`ALTER TABLE results ADD COLUMN points_fal INTEGER DEFAULT 0`).run(); } catch(e){}
        try { await env.DB.prepare(`ALTER TABLE results ADD COLUMN points_fts INTEGER DEFAULT 0`).run(); } catch(e){}
        try { await env.DB.prepare(`ALTER TABLE results ADD COLUMN position INTEGER`).run(); } catch(e){}

        const body = await request.json();
        const { round_id, results } = body;

        if (!round_id || !results || !Array.isArray(results)) {
            return errorRes("Dati mancanti: round_id e array results sono obbligatori.", 400);
        }

        const insertStmts = [];
        let totalRiders = 0;

        // 1. Pulizia dei dati precedenti per questo round (per evitare duplicati)
        // Recuperiamo le league_key presenti nel nuovo set per pulire solo quelle
        const leagueKeys = [...new Set(results.map(r => r.key))];
        for (const key of leagueKeys) {
            insertStmts.push(env.DB.prepare(`DELETE FROM division_results WHERE round_id = ? AND league_key = ?`).bind(round_id, key));
        }

        // 2. Elaborazione del payload
        for (const entry of results) {
            const key = entry.key;
            const data = entry.data;
            const teamPayload = data.payload || [];

            for (const team of teamPayload) {
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
                        round_id, key, teamName, riderName, zwid,
                        position, time, pts_finish, pts_fal, pts_fts,
                        pts_total, isInoxTeam ? 1 : 0
                    ));
                }
            }
        }

        // 3. Esecuzione batch
        if (insertStmts.length > 0) {
            // Dividiamo in blocchi di 500 per sicurezza (limite D1 batch)
            const chunkSize = 500;
            for (let i = 0; i < insertStmts.length; i += chunkSize) {
                await env.DB.batch(insertStmts.slice(i, i + chunkSize));
            }
        }

        // 4. Sincronizzazione tabella 'results' per i nostri atleti
        // Inseriamo solo se lo zwid esiste nella tabella athletes per evitare errori di Foreign Key
        await env.DB.prepare(`DELETE FROM results WHERE round_id = ? AND data_source = 'wtrl'`).bind(round_id).run();
        
        await env.DB.prepare(`
            INSERT INTO results (round_id, zwid, time, points_total, points_finish, points_fal, points_fts, position, data_source)
            SELECT dr.round_id, dr.zwid, dr.time, dr.points_total, dr.points_finish, dr.points_fal, dr.points_fts, dr.position, 'wtrl'
            FROM division_results dr
            JOIN athletes a ON dr.zwid = a.zwid
            WHERE dr.round_id = ? AND dr.is_inox = 1 AND dr.zwid > 0
        `).bind(round_id).run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Importazione completata: ${leagueKeys.length} divisioni, ${totalRiders} atleti.`,
            riders_count: totalRiders,
            leagues_count: leagueKeys.length
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return errorRes(`Errore critico durante l'importazione: ${err.message}`, 500);
    }
}
