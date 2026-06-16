// @ts-check

/**
 * Ingestione Squadre Inox via JSON.
 * Mappa i campi WTRL sulla tabella D1 'teams'.
 * Supporta sia il formato flat (teamlist) che il formato dettagliato (meta/riders).
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    
    // Il JsonIngestor avvolge il file in { data: { payload: [...] } }
    const { data, season_code, seasonId: bodySeasonId, wtrl_id } = body;
    const seasonId = parseInt(bodySeasonId || wtrl_id || 19);

    const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";

    try {
        if (!data) {
            throw new Error("Dati mancanti nel corpo della richiesta");
        }

        // Estrazione flessibile del payload
        let rawItems = data.payload || data;
        if (rawItems && !Array.isArray(rawItems) && rawItems.payload) {
            rawItems = rawItems.payload;
        }

        if (!Array.isArray(rawItems)) {
            console.error("[ImportTeams] Data is not an array:", rawItems);
            throw new Error("Formato JSON non valido: il payload deve essere un array");
        }

        console.log(`[ImportTeams] Elaborazione di ${rawItems.length} elementi per seasonId ${seasonId}.`);

        const inoxTeams = rawItems.filter(item => {
            const team = item.meta?.team || item;
            const cid = (team.clubId || '').toLowerCase();
            const name = (team.teamname || team.name || '').toUpperCase();
            const isMatch = cid === INOX_CLUB_ID.toLowerCase() || (name.includes("INOX") && !name.includes("EQUINOX"));
            return isMatch;
        });

        if (inoxTeams.length === 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Nessun team Inox trovato nel file. Verifica che il file contenga team del club Inox o con 'INOX' nel nome." 
            }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const queries = inoxTeams.map(item => {
            const team = item.meta?.team || item;
            const meta = item.meta || {};
            const comp = meta.competition || {};
            
            // Mapping robusto
            const wtrl_team_id = parseInt(team.id || team.teamid || meta.trc || 0);
            const teamname = team.teamname || team.name;
            const category = comp.division || team.division;
            const zrldivision = meta.division || team.zrldivision;
            
            // Estrazione Division Number (es. da "2370C30" -> 3)
            const leagueKey = comp.class || '';
            let divNum = parseInt(team.divnum || 0);
            if (!divNum && leagueKey) {
                const match = leagueKey.match(/^(\d+)0([A-D])(\d+)0$/);
                if (match) divNum = parseInt(match[3]);
            }

            const clubId = team.clubId || INOX_CLUB_ID;
            const tttid = parseInt(team.tttid || 0);
            const clubName = team.clubName || team.jerseyname || 'InoxTeam';
            const gender = team.gender || (category && category.includes('Women') ? 'Women' : 'Mixed');
            const league = team.league || comp.wtrlid || 'ZRL';
            const leagueColor = team.leagueColor || '';
            const rec = parseInt(team.rec || (team.recruiting ? 1 : 0) || 0);
            const status = parseInt(team.status || (comp.status === 'ACTIVE' ? 1 : 0) || 0);
            const isdev = parseInt(team.isdev || (team.isdev ? 1 : 0) || 0);
            const rounds = team.rounds || (comp.registered ? comp.registered.join(',') : '');
            const member_count = parseInt(team.members || meta.memberCount || 0);

            // Estrazione Capitano
            const captain_id = meta.administrators?.captain?.profileId ? parseInt(meta.administrators.captain.profileId) : null;

            if (!wtrl_team_id || !teamname) {
                console.warn("[ImportTeams] Dati team incompleti:", item);
            }

            return env.ZRL_DB.prepare(`
                INSERT INTO teams (
                    wtrl_team_id, season_id, name, category, division, division_number, 
                    club_id, tttid, club_name, gender, league, 
                    zrldivision, league_color, rec, status, is_dev, 
                    rounds, member_count, captain_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(wtrl_team_id, season_id) DO UPDATE SET
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
                    captain_id = excluded.captain_id
            `).bind(
                wtrl_team_id,
                seasonId,
                teamname,
                category,
                zrldivision, 
                divNum,
                clubId,
                tttid,
                clubName,
                gender,
                league,
                zrldivision,
                leagueColor,
                rec,
                status,
                isdev,
                rounds,
                member_count,
                captain_id
            );
        });

        // Filtraggio query nulle per sicurezza
        const validQueries = queries.filter(q => q !== null);
        
        if (seasonId) {
            validQueries.push(
                env.ZRL_DB.prepare(`
                    INSERT INTO season_lifecycle_status (season_id, status) 
                    VALUES (?, 'TEAMS_DONE') 
                    ON CONFLICT(season_id) DO UPDATE SET status = 'TEAMS_DONE', updated_at = CURRENT_TIMESTAMP
                `).bind(seasonId)
            );
        }

        await env.ZRL_DB.batch(validQueries);

        return new Response(JSON.stringify({
            success: true,
            message: `Sincronizzate ${inoxTeams.length} squadre InoxTeam.`
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("[ImportTeams Error]", err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

