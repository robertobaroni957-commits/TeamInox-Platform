// functions/api/admin/sync-teams.js
export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const seasonId = body.seasonId || 19;
        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
        
        const wtrlTeamsUrl = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=teamlist&test=dGVhbWxpc3Q%3D`;
        
        console.log("Inizio fetch da WTRL per stagione", seasonId);

        const response = await fetch(wtrlTeamsUrl, {
            headers: { 
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!response.ok) {
            throw new Error(`WTRL ha risposto con stato ${response.status}`);
        }

        // Recuperiamo il JSON. Se è molto grande, usiamo .json() che è ottimizzato in Cloudflare
        const data = await response.json();
        const allTeams = data.payload || [];
        
        // Filtriamo le squadre INOX
        const inoxTeams = allTeams.filter(t => t.clubId === INOX_CLUB_ID);

        if (inoxTeams.length === 0) {
            return new Response(JSON.stringify({ 
                success: true, 
                message: "Nessun team INOX trovato su WTRL per questa stagione.",
                count: 0 
            }), { headers: { "Content-Type": "application/json" } });
        }

        // Operazione Database: Svuotiamo e ripopoliamo
        // Usiamo una transazione batch per massimizzare la velocità
        const deleteStmt = env.DB.prepare("DELETE FROM teams");
        const insertStmts = inoxTeams.map(t => {
            return env.DB.prepare(`
                INSERT INTO teams (name, category, division, wtrl_team_id, club_id)
                VALUES (?, ?, ?, ?, ?)
            `).bind(
                t.teamname || t.name, 
                t.division || "N/A", 
                t.zrldivision || "N/A", 
                parseInt(t.id), 
                INOX_CLUB_ID
            );
        });

        // Eseguiamo tutto in un unico blocco atomico
        await env.DB.batch([deleteStmt, ...insertStmts]);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione riuscita! Importati ${inoxTeams.length} team reali INOX.`,
            count: inoxTeams.length 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("Sync Teams Error:", err.message);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Errore durante la sincronizzazione: " + err.message 
        }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
}
