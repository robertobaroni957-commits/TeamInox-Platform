// functions/api/admin/init-season.js
export async function onRequestPost({ request, env }) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401 });

    try {
        const { name, external_id, rounds } = await request.json();
        const seasonId = external_id || 19;

        if (!env.DB) return new Response(JSON.stringify({ error: "DB binding missing" }), { status: 500 });

        // 1. Reset Serie (archiviamo le precedenti)
        await env.DB.prepare("UPDATE series SET is_active = 0").run();
        
        // 2. Creazione Nuova Serie
        const seriesResult = await env.DB.prepare("INSERT INTO series (name, external_season_id, is_active, start_date) VALUES (?, ?, 1, CURRENT_TIMESTAMP)")
            .bind(name, seasonId)
            .run();
        const seriesId = seriesResult.meta.last_row_id;

        // 3. Inserimento Round (se forniti)
        if (rounds && Array.isArray(rounds)) {
            const roundStatements = rounds.map(r => {
                const strategyDetails = JSON.stringify({
                    fal_segments: r.fal_segments || [],
                    fts_segments: r.fts_segments || [],
                    powerup_details: r.powerup_details || ""
                });

                return env.DB.prepare(`
                    INSERT INTO rounds (series_id, name, date, world, route, format, distance, elevation, powerups, strategy_details)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    seriesId, r.name, r.date, r.world, r.route,
                    r.format || 'Scratch', r.distance || 0, r.elevation || 0,
                    r.powerups || '', strategyDetails
                );
            });
            if (roundStatements.length > 0) await env.DB.batch(roundStatements);
        }

        // 4. SYNC TEAM INOX DA WTRL (API teamlist ufficiale)
        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
        const wtrlTeamsUrl = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=teamlist&test=dGVhbWxpc3Q%3D`;
        
        let syncedTeamsCount = 0;
        
        // Puliamo i vecchi team prima di importare quelli reali
        await env.DB.prepare("DELETE FROM teams").run();

        const teamResponse = await fetch(wtrlTeamsUrl, {
            headers: { 
                "accept": "application/json",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (teamResponse.ok) {
            const teamData = await teamResponse.json();
            const allTeams = teamData.payload || [];
            
            // Filtriamo le squadre del club Inox
            const inoxTeams = allTeams.filter(t => t.clubId === INOX_CLUB_ID);
            
            if (inoxTeams.length > 0) {
                const teamStatements = inoxTeams.map(t => {
                    return env.DB.prepare(`
                        INSERT INTO teams (name, category, division, wtrl_team_id, club_id)
                        VALUES (?, ?, ?, ?, ?)
                    `).bind(
                        t.teamname, 
                        t.division,      
                        t.zrldivision,   
                        parseInt(t.id), 
                        INOX_CLUB_ID
                    );
                });

                await env.DB.batch(teamStatements);
                syncedTeamsCount = inoxTeams.length;
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Stagione inizializzata con successo! Sincronizzati ${syncedTeamsCount} team reali INOX.`,
            series_id: seriesId,
            teams_found: syncedTeamsCount
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
