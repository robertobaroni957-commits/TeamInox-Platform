// functions/api/admin/init-season.js
export async function onRequestPost({ request, env }) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401 });

    try {
        const { name, external_id, rounds } = await request.json();

        if (!env.DB) return new Response(JSON.stringify({ error: "DB binding missing" }), { status: 500 });

        // 1. Archivio stagioni precedenti (Transaction)
        await env.DB.prepare("UPDATE series SET is_active = 0").run();
        
        // 2. Creazione Nuova Serie (Season)
        const seriesResult = await env.DB.prepare("INSERT INTO series (name, external_season_id, is_active, start_date) VALUES (?, ?, 1, CURRENT_TIMESTAMP)")
            .bind(name, external_id)
            .run();
        const seriesId = seriesResult.meta.last_row_id;

        // 3. Inserimento Round
        if (rounds && Array.isArray(rounds)) {
            const roundStatements = rounds.map(r => {
                const strategyDetails = JSON.stringify({
                    fal_segments: r.fal_segments || [],
                    fts_segments: r.fts_segments || [],
                    powerup_details: r.powerup_details || ""
                });

                return env.DB.prepare(`
                    INSERT INTO rounds (
                        series_id, name, date, world, route, 
                        format, distance, elevation, powerups, strategy_details
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    seriesId, r.name, r.date, r.world, r.route,
                    r.format || 'Scratch', r.distance || 0, r.elevation || 0,
                    r.powerups || '', strategyDetails
                );
            });
            if (roundStatements.length > 0) await env.DB.batch(roundStatements);
        }

        // 4. SYNC TEAM INOX DA WTRL (MIGLIORATO)
        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
        // Spesso WTRL richiede sia clubId che seasonId per filtrare correttamente
        const wtrlTeamsUrl = `https://www.wtrl.racing/api/zrl/teams.php?clubId=${INOX_CLUB_ID}&seasonId=${external_id}`;
        
        let syncedTeamsCount = 0;
        try {
            const teamResponse = await fetch(wtrlTeamsUrl, {
                headers: { "accept": "application/json" }
            });

            if (teamResponse.ok) {
                const teamData = await teamResponse.json();
                // Verifichiamo se i dati sono in payload o direttamente nel body
                const teams = teamData.payload || (Array.isArray(teamData) ? teamData : []);
                
                if (teams.length > 0) {
                    const teamStatements = teams.map(t => {
                        return env.DB.prepare(`
                            INSERT INTO teams (name, category, division, wtrl_team_id, club_id)
                            VALUES (?, ?, ?, ?, ?)
                            ON CONFLICT(wtrl_team_id) DO UPDATE SET 
                                name = excluded.name,
                                category = excluded.category,
                                division = excluded.division
                        `).bind(t.teamname || t.name, t.division || 'N/A', t.zrldivision || 'N/A', parseInt(t.id || t.wtrl_team_id), INOX_CLUB_ID);
                    });

                    await env.DB.batch(teamStatements);
                    syncedTeamsCount = teams.length;
                }
            }
        } catch (syncErr) {
            console.error("Errore sincronizzazione team da WTRL:", syncErr);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Stagione ${name} inizializzata. Sincronizzati ${syncedTeamsCount} team Inox.`,
            series_id: seriesId,
            teams_found: syncedTeamsCount
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
