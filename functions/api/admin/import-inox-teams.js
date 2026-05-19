import { requireActiveSeason } from './season/SeasonContextService';

export async function onRequestPost({ request, env }) {
    const errorRes = (msg, status = 500) => new Response(
        JSON.stringify({ success: false, error: msg }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        if (!env.ZRL_DB) return errorRes("Database non trovato", 500);

        // Enforce season context
        const season = await requireActiveSeason(env.ZRL_DB);
        const seasonId = season.id;

        const body = await request.json();
        const teamsData = body.teams || body;

        if (!Array.isArray(teamsData) || teamsData.length === 0) {
            return errorRes("Dati team non validi o mancanti.", 400);
        }

        const updates = [];
        let processedTeams = 0;
        let processedAthletes = 0;

        for (const entry of teamsData) {
            const meta = entry.meta;
            if (!meta || !meta.team) continue;

            const team = meta.team;
            const comp = meta.competition;
            const riders = entry.riders || [];
            
            const name = team.name;
            const wtrl_team_id = meta.trc || team.teamid;
            const tttid = team.tttid;
            const category = comp.division;
            const division = meta.division;
            const leagueKey = comp.class || '';
            const member_count = meta.memberCount || 0;
            const is_dev = team.isdev ? 1 : 0;

            let league = '';
            let divNum = null;

            const match = leagueKey.match(/^(\d+)0([A-D])(\d+)0$/);
            if (match) {
                league = match[1];
                divNum = parseInt(match[3]);
            } else {
                const simpleMatch = leagueKey.match(/^(\d+)0([A-D])(\d*)$/);
                if (simpleMatch) {
                    league = simpleMatch[1];
                    divNum = simpleMatch[3] ? parseInt(simpleMatch[3]) : null;
                }
            }

            // Inserimento Team con seasonId
            updates.push(env.ZRL_DB.prepare(`
                INSERT INTO teams (wtrl_team_id, name, category, division, division_number, tttid, league, member_count, is_dev, season_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(wtrl_team_id) DO UPDATE SET 
                    name = excluded.name,
                    category = excluded.category,
                    division = excluded.division,
                    division_number = excluded.division_number,
                    tttid = excluded.tttid,
                    league = excluded.league,
                    member_count = excluded.member_count,
                    is_dev = excluded.is_dev,
                    season_id = excluded.season_id
            `).bind(wtrl_team_id, name, category, division, divNum, tttid, league, member_count, is_dev, seasonId));

            for (const rider of riders) {
                const zwid = rider.profileId;
                if (!zwid) continue;

                updates.push(env.ZRL_DB.prepare(`
                    INSERT INTO athletes (zwid, name, base_category, profile_id, wtrl_user_id)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(zwid) DO UPDATE SET
                        name = excluded.name,
                        base_category = excluded.base_category
                `).bind(zwid, rider.name, rider.category, zwid, rider.userId));

                updates.push(env.ZRL_DB.prepare(`
                    INSERT OR IGNORE INTO team_members (team_id, athlete_id, season_id)
                    VALUES (?, ?, ?)
                `).bind(wtrl_team_id, zwid, seasonId));

                processedAthletes++;
            }
            
            processedTeams++;
        }

        if (updates.length > 0) {
            await env.ZRL_DB.batch(updates);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione stagione ${season.name} completata.`,
            teams: processedTeams,
            athletes: processedAthletes
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return errorRes(`Errore: ${err.message}`, 500);
    }
}

