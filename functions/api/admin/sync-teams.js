// functions/api/admin/sync-teams.js
export async function onRequestPost({ request, env }) {
    // Risposta standard per errori JSON
    const errorRes = (msg, status = 500, detail = null) => new Response(
        JSON.stringify({ success: false, error: msg, detail }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        // 1. Verifica DB Binding (Causa comune di 500 su Pages)
        if (!env.DB) {
            return errorRes("Configurazione Server Errata: Database Binding 'DB' non trovato nelle impostazioni Functions di Cloudflare.", 500);
        }

        // 2. Parsing robusto del body (senza crashare se vuoto)
        let seasonId = 19;
        try {
            const contentType = request.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                const body = await request.json().catch(() => ({}));
                if (body && body.seasonId) seasonId = body.seasonId;
            }
        } catch (e) {
            console.warn("Body parsing skipped or failed:", e.message);
        }

        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
        const WTRL_COOKIE = env.WTRL_COOKIE || "";
        
        const wtrlTeamsUrl = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=teamlist&test=dGVhbWxpc3Q%3D`;
        
        console.log("Fetching WTRL data for season:", seasonId);

        // 3. Fetch da WTRL con timeout breve
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        try {
            const response = await fetch(wtrlTeamsUrl, {
                headers: { 
                    "Accept": "application/json",
                    "Cookie": WTRL_COOKIE,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                return errorRes(`WTRL API ha risposto con errore ${response.status}`, response.status);
            }

            const data = await response.json();
            const allTeams = data.payload || [];
            
            // 4. Filtraggio Team
            const inoxTeams = allTeams.filter(t => {
                const cid = t.clubId || t.club_id;
                const name = (t.teamname || t.name || "").toUpperCase();
                return cid === INOX_CLUB_ID || (name.includes("INOX") && !name.includes("EQUINOX"));
            });

            if (inoxTeams.length === 0) {
                return new Response(JSON.stringify({ 
                    success: true, 
                    message: "Nessun team INOX trovato su WTRL. Verifica l'ID stagione.",
                    count: 0 
                }), { headers: { "Content-Type": "application/json" } });
            }

            // 5. Aggiornamento DB in Batch
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
            }).filter(s => s !== null);

            if (insertStmts.length > 0) {
                await env.DB.batch(insertStmts);
            }

            return new Response(JSON.stringify({ 
                success: true, 
                message: `Sincronizzazione completata! Aggiornati ${inoxTeams.length} team.`,
                count: inoxTeams.length 
            }), { headers: { "Content-Type": "application/json" } });

        } catch (fetchErr) {
            clearTimeout(timeout);
            return errorRes("Errore di connessione a WTRL (Timeout o Rete)", 502, fetchErr.message);
        }

    } catch (err) {
        return errorRes("Errore critico nel Worker", 500, err.message);
    }
}
