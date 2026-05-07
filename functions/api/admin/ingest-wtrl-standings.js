
export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { externalSeasonId, leagueKey, payload, leagues } = body;

        if (!externalSeasonId) {
            return new Response(JSON.stringify({ error: "externalSeasonId mancante" }), { status: 400 });
        }

        // 1. Trova il Round Group
        const roundGroup = await env.DB.prepare(`
            SELECT id FROM zrl_round_groups WHERE external_season_id = ? LIMIT 1
        `).bind(externalSeasonId).first();

        if (!roundGroup) {
            return new Response(JSON.stringify({ error: "Round Group non trovato per ID " + externalSeasonId }), { status: 404 });
        }

        const roundGroupId = roundGroup.id;
        const insertStmts = [];

        // 2. Normalizziamo i dati: gestiamo sia singola lega che multi-lega
        const leaguesToProcess = leagues || [{ leagueKey, payload }];

        for (const currentLega of leaguesToProcess) {
            if (!currentLega.leagueKey || !currentLega.payload) continue;

            // Recupero nome lega dalla tabella teams con logica di matching robusta
            const leagueInfo = await env.DB.prepare(`
                SELECT division FROM teams 
                WHERE (league || '0' || category || division_number || '0') = ?
                OR (league || '0' || zrldivision || division_number || '0') = ?
                LIMIT 1
            `).bind(currentLega.leagueKey, currentLega.leagueKey).first();

            const leagueName = leagueInfo?.division || null; // Salviamo NULL se non trovato per usare il fallback nel frontend

            // Pulizia per questa specifica lega
            insertStmts.push(env.DB.prepare(`DELETE FROM zrl_team_standings WHERE round_group_id = ? AND league_key = ?`).bind(roundGroupId, currentLega.leagueKey));

            for (const team of currentLega.payload) {
                const teamName = team.d;
                const isInox = teamName.toUpperCase().includes("INOX");
                const totalRacePoints = parseInt(team.e) || 0;

                insertStmts.push(env.DB.prepare(`
                    INSERT INTO zrl_team_standings (
                        round_group_id, league_key, league_name, team_name, rank, 
                        league_points, pts_fal, pts_fts, pts_finish, total_race_points,
                        r1, r2, r3, r4, r5, r6, r7, r8, is_inox
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    roundGroupId, currentLega.leagueKey, leagueName, teamName, team.c, 
                    team.j, team.e, team.k, team.i, totalRacePoints,
                    team.r1, team.r2, team.r3, team.r4, team.r5, team.r6, team.r7, team.r8,
                    isInox ? 1 : 0
                ));
            }
        }

        // 3. Esecuzione batch (divisa per sicurezza se troppi dati)
        for (let i = 0; i < insertStmts.length; i += 100) {
            await env.DB.batch(insertStmts.slice(i, i + 100));
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Classifiche aggiornate per ${leaguesToProcess.length} divisioni.` 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
