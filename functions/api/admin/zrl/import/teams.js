// @ts-check

/**
 * Ingestione Squadre Inox via JSON.
 * Mappa i campi WTRL sulla tabella D1 'teams'.
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { data, season_code } = body;

    const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";

    try {
        if (!data) {
            throw new Error("Dati mancanti nel corpo della richiesta");
        }

        // Estrazione flessibile del payload (gestisce annidamenti multipli da frontend/scraper)
        let rawTeams = data.payload || data;
        
        // Se è ancora un oggetto con .payload (doppio annidamento), scendiamo di un livello
        if (rawTeams && !Array.isArray(rawTeams) && rawTeams.payload) {
            rawTeams = rawTeams.payload;
        }

        if (!Array.isArray(rawTeams)) {
            console.error("[ImportTeams] Data is not an array:", rawTeams);
            throw new Error("Formato JSON non valido: il payload deve essere un array di squadre");
        }

        // Debug: log the first 5 teams and their clubIds
        console.log("[ImportTeams] Sample:", rawTeams.slice(0, 5).map(t => ({ name: t.teamname, clubId: t.clubId })));

        const inoxTeams = rawTeams.filter(team => {
            const cid = (team.clubId || '').toLowerCase();
            const name = (team.teamname || team.name || '').toUpperCase();
            const isMatch = cid === INOX_CLUB_ID.toLowerCase() || (name.includes("INOX") && !name.includes("EQUINOX"));
            if (!isMatch) console.log(`[ImportTeams] Escludo team: ${name} (ClubID: ${cid})`);
            return isMatch;
        });

        if (inoxTeams.length === 0) {
            return new Response(JSON.stringify({ success: false, error: "Nessun team Inox trovato." }), { status: 400 });
        }

        const queries = inoxTeams.map(team => {
            return env.ZRL_DB.prepare(`
                INSERT INTO teams (
                    wtrl_team_id, name, category, division, division_number, 
                    club_id, tttid, club_name, gender, league, 
                    zrldivision, league_color, rec, status, is_dev, 
                    rounds, member_count, season_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    member_count = excluded.member_count,
                    season_code = excluded.season_code
            `).bind(
                parseInt(team.id),
                team.teamname,
                team.division,
                team.zrldivision,
                parseInt(team.divnum) || 0,
                team.clubId,
                parseInt(team.tttid) || 0,
                team.clubName,
                team.gender,
                team.league,
                team.zrldivision,
                team.leagueColor,
                parseInt(team.rec) || 0,
                parseInt(team.status) || 0,
                parseInt(team.isdev) || 0,
                team.rounds,
                parseInt(team.members) || 0,
                season_code || 'zrl_25_26'
            );
        });

        await env.ZRL_DB.batch(queries);

        return new Response(JSON.stringify({
            success: true,
            message: `Sincronizzate ${inoxTeams.length} squadre InoxTeam.`
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
