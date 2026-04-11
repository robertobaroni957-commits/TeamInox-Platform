// functions/api/admin/sync-teams.js
export async function onRequestPost({ request, env }) {
    try {
        // Verifica DB Binding
        if (!env.DB) {
            console.error("D1 Database Binding 'DB' non trovato.");
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Configurazione Server Errata: Database Binding 'DB' non trovato. Verifica le impostazioni su Cloudflare Dashboard." 
            }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        // Parsing robusto del body
        let body;
        try {
            const text = await request.text();
            body = text ? JSON.parse(text) : {};
        } catch (e) {
            body = {};
        }

        const seasonId = body.seasonId || 19;
        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
        const WTRL_COOKIE = env.WTRL_COOKIE || "";
        
        const wtrlTeamsUrl = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=teamlist&test=dGVhbWxpc3Q%3D`;
        
        console.log("Inizio fetch da WTRL per stagione", seasonId);

        const response = await fetch(wtrlTeamsUrl, {
            headers: { 
                "Accept": "application/json",
                "Cookie": WTRL_COOKIE,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(JSON.stringify({ 
                success: false, 
                error: `WTRL API Error: ${response.status}`,
                detail: errorText.substring(0, 500)
            }), { status: response.status, headers: { "Content-Type": "application/json" } });
        }

        const data = await response.json();
        const allTeams = data.payload || [];
        
        const inoxTeams = allTeams.filter(t => {
            const clubId = t.clubId || t.club_id;
            const teamName = (t.teamname || t.name || "").toUpperCase();
            return clubId === INOX_CLUB_ID || (teamName.includes("INOX") && !teamName.includes("EQUINOX"));
        });

        if (inoxTeams.length === 0) {
            return new Response(JSON.stringify({ 
                success: true, 
                message: "Nessun team INOX trovato su WTRL per questa stagione. Verifica l'ID stagione o i permessi.",
                count: 0 
            }), { headers: { "Content-Type": "application/json" } });
        }

        const insertStmts = inoxTeams.map(t => {
            const wtrlId = parseInt(t.id || t.wtrl_team_id);
            if (isNaN(wtrlId)) return null;

            return env.DB.prepare(`
                INSERT INTO teams (name, category, division, wtrl_team_id, club_id)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(wtrl_team_id) DO UPDATE SET
                    name = excluded.name,
                    category = excluded.category,
                    division = excluded.division,
                    club_id = excluded.club_id
            `).bind(
                t.teamname || t.name, 
                t.division || "N/A", 
                t.zrldivision || "N/A", 
                wtrlId, 
                INOX_CLUB_ID
            );
        }).filter(stmt => stmt !== null);

        if (insertStmts.length > 0) {
            await env.DB.batch(insertStmts);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione riuscita! Aggiornati ${inoxTeams.length} team INOX.`,
            count: inoxTeams.length 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("Sync Teams Error:", err.message);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Errore interno durante la sincronizzazione: " + err.message,
            stack: err.stack 
        }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
}
