export async function onRequestPost({ request, env }) {
    const errorRes = (msg, status = 500) => new Response(
        JSON.stringify({ success: false, error: msg }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        if (!env.ZRL_DB) return errorRes("Database non trovato", 500);

        const body = await request.json();
        
        // Estrazione flessibile (JsonIngestor avvolge in { data: { payload: [...] } })
        let teamsData = body.data?.payload || body.teams || body;
        
        // Ulteriore discesa se ancora annidato
        if (teamsData && !Array.isArray(teamsData) && teamsData.payload) {
            teamsData = teamsData.payload;
        }

        const seasonCode = body.season_code; // Allow explicit season context

        if (!seasonCode) return errorRes("season_code richiesto", 400);

        if (!Array.isArray(teamsData) || teamsData.length === 0) {
            console.error("[ImportMaster] Invalid teamsData:", teamsData);
            return errorRes("Dati team non validi o mancanti.", 400);
        }

        // Fetch season id by code
        const season = await env.ZRL_DB.prepare("SELECT id FROM seasons WHERE code = ?").bind(seasonCode).first();
        if (!season) return errorRes(`Stagione con codice '${seasonCode}' non trovata`, 404);
        const seasonId = season.id;
        
        console.log(`[ImportMaster] Elaborazione di ${teamsData.length} team per la stagione ${season.name} (ID: ${seasonId})`);

        const updates = [];
        let processedTeams = 0;
        let processedAthletes = 0;

        for (const entry of teamsData) {
            const meta = entry.meta;
            if (!meta || !meta.team) continue;

            const team = meta.team;
            const comp = meta.competition || {};
            const riders = entry.riders || entry.members || [];
            
            const name = team.name;
            const wtrl_team_id = parseInt(meta.trc || team.teamid || team.id);
            const permanent_team_id = parseInt(team.teamid || team.id || meta.trc);
            const tttid = parseInt(team.tttid || 0);
            const category = comp.division || team.division;
            const division = meta.division || team.zrldivision;
            const leagueKey = comp.class || '';
            const member_count = parseInt(meta.memberCount || team.members || 0);
            const is_dev = (team.isdev || team.is_dev) ? 1 : 0;

            let league = team.league || comp.wtrlid || 'ZRL';
            let divNum = parseInt(team.divnum || 0);

            if (!divNum && leagueKey) {
                const match = leagueKey.match(/^(\d+)0([A-D])(\d+)0$/);
                if (match) {
                    divNum = parseInt(match[3]);
                }
            }

            // Estrazione Capitano e Manager
            // Supporto flessibile per meta.administrators o direttamente sotto meta
            const admins = meta.administrators || {};
            const captain_data = admins.captain || meta.captain;
            const captain_id = captain_data?.profileId ? parseInt(captain_data.profileId) : null;
            
            const rawManagers = admins.managers || meta.managers || [];
            const managerIds = Array.isArray(rawManagers) 
                ? rawManagers.map(m => parseInt(m.profileId)) 
                : [];

            // 1. UPSERT ADMINS
            const staff = [];
            if (captain_data) staff.push({ ...captain_data, role: 'captain' });
            if (Array.isArray(rawManagers)) {
                rawManagers.forEach(m => staff.push({ ...m, role: 'moderator' }));
            }

            for (const person of staff) {
                const pid = parseInt(person.profileId);
                if (!pid) continue;
                updates.push(env.ZRL_DB.prepare(`
                    INSERT INTO athletes (zwid, name, role)
                    VALUES (?, ?, ?)
                    ON CONFLICT(zwid) DO UPDATE SET
                        name = excluded.name,
                        role = CASE 
                            WHEN COALESCE(athletes.role, 'athlete') = 'admin' THEN 'admin'
                            WHEN excluded.role = 'moderator' THEN 'moderator'
                            WHEN excluded.role = 'captain' AND COALESCE(athletes.role, 'athlete') NOT IN ('admin', 'moderator') THEN 'captain'
                            ELSE COALESCE(athletes.role, excluded.role)
                        END
                `).bind(pid, `${person.firstName} ${person.lastName}`, person.role));
            }

            // 2. Inserimento Team
            updates.push(env.ZRL_DB.prepare(`
                INSERT INTO teams (wtrl_team_id, name, category, division, division_number, tttid, league, member_count, is_dev, captain_id, season_id, permanent_team_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(wtrl_team_id, season_id) DO UPDATE SET 
                    name = excluded.name,
                    category = excluded.category,
                    division = excluded.division,
                    division_number = excluded.division_number,
                    tttid = excluded.tttid,
                    league = excluded.league,
                    member_count = excluded.member_count,
                    is_dev = excluded.is_dev,
                    captain_id = excluded.captain_id,
                    permanent_team_id = excluded.permanent_team_id
            `).bind(wtrl_team_id, name, category, division, divNum, tttid, league, member_count, is_dev, captain_id, seasonId, permanent_team_id));

            // 3. Inserimento Riders
            for (const rider of riders) {
                const zwid = parseInt(rider.profileId || rider.zwid || rider.tmuid);
                if (!zwid) continue;

                const isCaptain = (zwid === captain_id);
                const isManager = managerIds.includes(zwid);
                
                let newRole = 'athlete';
                if (isManager) newRole = 'moderator';
                else if (isCaptain) newRole = 'captain';

                updates.push(env.ZRL_DB.prepare(`
                    INSERT INTO athletes (zwid, name, base_category, avatar_url, role)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(zwid) DO UPDATE SET
                        name = excluded.name,
                        base_category = excluded.base_category,
                        avatar_url = COALESCE(excluded.avatar_url, athletes.avatar_url),
                        role = CASE 
                            WHEN COALESCE(athletes.role, 'athlete') = 'admin' THEN 'admin'
                            WHEN excluded.role = 'moderator' THEN 'moderator'
                            WHEN excluded.role = 'captain' AND COALESCE(athletes.role, 'athlete') NOT IN ('admin', 'moderator') THEN 'captain'
                            ELSE COALESCE(athletes.role, excluded.role)
                        END
                `).bind(zwid, rider.name, rider.category, rider.avatar, newRole));

                updates.push(env.ZRL_DB.prepare(`
                    INSERT OR IGNORE INTO team_members (team_id, athlete_id, season_id, name, category, is_active)
                    VALUES (?, ?, ?, ?, ?, 1)
                `).bind(wtrl_team_id, zwid, seasonId.toString(), rider.name, rider.category));

                processedAthletes++;
            }
            processedTeams++;
        }

        // --- ESECUZIONE A BLOCCHI (Importante per limiti D1) ---
        const CHUNK_SIZE = 50;
        for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
            const chunk = updates.slice(i, i + CHUNK_SIZE);
            await env.ZRL_DB.batch(chunk);
            console.log(`[ImportMaster] Processato chunk ${i / CHUNK_SIZE + 1}/${Math.ceil(updates.length / CHUNK_SIZE)}`);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione stagione ${season.name} completata. Processati ${processedTeams} team e ${processedAthletes} atleti.`,
            teams: processedTeams,
            athletes: processedAthletes
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("[ImportMaster Error]", err);
        return errorRes(`Errore: ${err.message}`, 500);
    }
}
