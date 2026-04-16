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
        
        // URL pulito
        const wtrlTeamsUrl = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=teamlist&test=dGVhbWxpc3Q%3D`;
        
        console.log("Fetching WTRL:", wtrlTeamsUrl);

        try {
            // Usiamo una fetch semplice con gli stessi headers di sync-all-teams
            const response = await fetch(wtrlTeamsUrl, {
                headers: { 
                    "accept": "application/json",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "cookie": WTRL_COOKIE
                }
            });

            if (!response.ok) {
                const txt = await response.text().catch(() => "N/A");
                return errorRes(`WTRL Error ${response.status}: ${txt.substring(0, 50)}`, response.status);
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
                    message: `Nessun team INOX trovato per la stagione ${seasonId}.`,
                    count: 0 
                }), { headers: { "Content-Type": "application/json" } });
            }

            const insertStmts = inoxTeams.map(t => {
                const wtrlId = parseInt(t.id || t.wtrl_team_id);
                if (isNaN(wtrlId)) return null;

                return env.DB.prepare(`
                    INSERT INTO teams (
                        name, category, division, division_number, wtrl_team_id, club_id,
                        tttid, club_name, gender, league, zrldivision, league_color,
                        rec, status, is_dev, rounds, member_count
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(wtrl_team_id) DO UPDATE SET
                        name = excluded.name,
                        category = excluded.category,
                        division = excluded.division,
                        division_number = excluded.division_number,
                        club_id = excluded.club_id,
                        tttid = excluded.tttid,
                        club_name = excluded.club_name,
                        gender = excluded.gender,
                        league = excluded.league,
                        zrldivision = excluded.zrldivision,
                        league_color = excluded.league_color,
                        rec = excluded.rec,
                        status = excluded.status,
                        is_dev = excluded.is_dev,
                        rounds = excluded.rounds,
                        member_count = excluded.member_count
                `).bind(
                    t.teamname || t.name, 
                    t.division || "N/A", 
                    t.zrldivision || "N/A", 
                    parseInt(t.divnum) || 0,
                    wtrlId, 
                    INOX_CLUB_ID,
                    parseInt(t.tttid) || null,
                    t.clubName || '',
                    t.gender || '',
                    t.league || '',
                    t.zrldivision || '',
                    t.leagueColor || '',
                    parseInt(t.rec) || 0,
                    parseInt(t.status) || 0,
                    parseInt(t.isdev) || 0,
                    t.rounds || '',
                    parseInt(t.members) || 0
                );
            }).filter(s => s !== null);

            if (insertStmts.length > 0) {
                await env.DB.batch(insertStmts);
            }

            return new Response(JSON.stringify({ 
                success: true, 
                message: `Sincronizzazione riuscita! ${inoxTeams.length} team aggiornati.`,
                count: inoxTeams.length 
            }), { headers: { "Content-Type": "application/json" } });

        } catch (fetchErr) {
            // Portiamo l'errore tecnico nel messaggio principale per vederlo in UI
            return errorRes(`Errore di rete verso WTRL: ${fetchErr.message}`, 504);
        }

    } catch (err) {
        return errorRes(`Errore critico: ${err.message}`, 500);
    }
}
