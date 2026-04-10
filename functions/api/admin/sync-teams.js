// functions/api/admin/sync-teams.js
export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const seasonId = body.seasonId || 19;
        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
        
        // URL Ufficiale per la lista dei team
        const wtrlTeamsUrl = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=teamlist&test=dGVhbWxpc3Q%3D`;
        
        const response = await fetch(wtrlTeamsUrl, {
            headers: { 
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!response.ok) {
            throw new Error(`WTRL risponde con errore ${response.status}`);
        }

        const data = await response.json();
        const allTeams = data.payload || [];
        const inoxTeams = allTeams.filter(t => t.clubId === INOX_CLUB_ID);

        if (inoxTeams.length === 0) {
            return new Response(JSON.stringify({ 
                success: true, 
                message: "Nessun team trovato per questo Club ID su WTRL.",
                count: 0 
            }), { headers: { "Content-Type": "application/json" } });
        }

        // Svuotiamo e ripopoliamo i team
        await env.DB.prepare("DELETE FROM teams").run();

        const statements = inoxTeams.map(t => {
            return env.DB.prepare(`
                INSERT INTO teams (name, category, division, wtrl_team_id, club_id)
                VALUES (?, ?, ?, ?, ?)
            `).bind(t.teamname, t.division, t.zrldivision, parseInt(t.id), INOX_CLUB_ID);
        });

        await env.DB.batch(statements);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzati ${inoxTeams.length} team reali INOX.`,
            count: inoxTeams.length 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
}
