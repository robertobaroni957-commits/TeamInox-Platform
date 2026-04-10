// functions/api/admin/init-season.js
export async function onRequestPost({ request, env }) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { "Content-Type": "application/json" } 
    });

    try {
        const body = await request.json();
        const { name, external_id, rounds } = body;
        const seasonId = external_id || 19;

        if (!env.DB) throw new Error("Database binding (env.DB) non trovato.");

        // 1. Reset Serie (archiviamo le precedenti)
        await env.DB.prepare("UPDATE series SET is_active = 0").run();
        
        // 2. Creazione Nuova Serie
        const seriesResult = await env.DB.prepare("INSERT INTO series (name, external_season_id, is_active, start_date) VALUES (?, ?, 1, CURRENT_TIMESTAMP)")
            .bind(name || "Nuova Stagione", seasonId)
            .run();
        const seriesId = seriesResult.meta.last_row_id;

        // 3. Inserimento Round
        if (rounds && Array.isArray(rounds) && rounds.length > 0) {
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
            await env.DB.batch(roundStatements);
        }

        // 4. SYNC TEAM INOX DA WTRL
        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
        const wtrlTeamsUrl = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=teamlist&test=dGVhbWxpc3Q%3D`;
        
        let syncedTeamsCount = 0;
        
        const teamResponse = await fetch(wtrlTeamsUrl, {
            headers: { 
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (teamResponse.ok) {
            const teamData = await teamResponse.json();
            const allTeams = teamData.payload || [];
            
            // Filtriamo le squadre del club Inox
            const inoxTeams = allTeams.filter(t => t.clubId === INOX_CLUB_ID);
            
            if (inoxTeams.length > 0) {
                // Puliamo i vecchi team solo se abbiamo ricevuto nuovi dati validi
                await env.DB.prepare("DELETE FROM teams").run();

                // Prepariamo gli inserimenti
                const teamStatements = inoxTeams.map(t => {
                    return env.DB.prepare(`
                        INSERT INTO teams (name, category, division, wtrl_team_id, club_id)
                        VALUES (?, ?, ?, ?, ?)
                    `).bind(
                        t.teamname || "Unknown Team", 
                        t.division || "N/A",      
                        t.zrldivision || "N/A",   
                        parseInt(t.id), 
                        INOX_CLUB_ID
                    );
                });

                // Eseguiamo in batch (D1 gestisce bene fino a 100 statements alla volta)
                await env.DB.batch(teamStatements);
                syncedTeamsCount = inoxTeams.length;
            }
        } else {
            console.error("WTRL API Error:", teamResponse.status);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Stagione inizializzata! Sincronizzati ${syncedTeamsCount} team reali INOX.`,
            series_id: seriesId,
            teams_found: syncedTeamsCount
        }), { 
            status: 200,
            headers: { "Content-Type": "application/json" } 
        });

    } catch (err) {
        console.error("Init Season Error:", err.message);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Errore durante l'inizializzazione: " + err.message 
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" } 
        });
    }
}
