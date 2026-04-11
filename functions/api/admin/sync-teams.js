// functions/api/admin/sync-teams.js
export async function onRequestPost({ request, env }) {
    const errorRes = (msg, status = 500, detail = null) => new Response(
        JSON.stringify({ success: false, error: msg, detail }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        if (!env.DB) {
            return errorRes("Configurazione Server Errata: Database Binding 'DB' non trovato.", 500);
        }

        let seasonId = 19;
        try {
            const contentType = request.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                const body = await request.json().catch(() => ({}));
                if (body && body.seasonId) seasonId = body.seasonId;
            }
        } catch (e) {}

        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
        const WTRL_COOKIE = env.WTRL_COOKIE || "";
        
        // URL WTRL per la lista team
        const wtrlTeamsUrl = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=teamlist&test=dGVhbWxpc3Q%3D`;
        
        // Aumentiamo il timeout a 25 secondi (WTRL può essere molto lento)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);

        try {
            const response = await fetch(wtrlTeamsUrl, {
                headers: { 
                    "Accept": "application/json",
                    "Cookie": WTRL_COOKIE,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
                },
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const txt = await response.text().catch(() => "");
                return errorRes(`WTRL ha risposto con errore ${response.status}`, response.status, txt.substring(0, 100));
            }

            const data = await response.json();
            const allTeams = data.payload || [];
            
            const inoxTeams = allTeams.filter(t => {
                const cid = t.clubId || t.club_id;
                const name = (t.teamname || t.name || "").toUpperCase();
                return cid === INOX_CLUB_ID || (name.includes("INOX") && !name.includes("EQUINOX"));
            });

            if (inoxTeams.length === 0) {
                return new Response(JSON.stringify({ 
                    success: true, 
                    message: `Nessun team INOX trovato (Season ${seasonId}). Verifica se la stagione è corretta su WTRL.`,
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
            }).filter(s => s !== null);

            if (insertStmts.length > 0) {
                await env.DB.batch(insertStmts);
            }

            return new Response(JSON.stringify({ 
                success: true, 
                message: `Sincronizzazione riuscita! Aggiornati ${inoxTeams.length} team INOX per la stagione ${seasonId}.`,
                count: inoxTeams.length 
            }), { headers: { "Content-Type": "application/json" } });

        } catch (fetchErr) {
            clearTimeout(timeout);
            const isTimeout = fetchErr.name === 'AbortError';
            return errorRes(
                isTimeout ? "Timeout: WTRL ha impiegato più di 25 secondi a rispondere." : "Errore di rete verso WTRL",
                504, 
                fetchErr.message
            );
        }

    } catch (err) {
        return errorRes("Errore interno nel caricamento", 500, err.message);
    }
}
