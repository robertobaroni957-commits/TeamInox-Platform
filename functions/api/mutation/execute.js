// functions/api/mutation/execute.js

const MUTATION_HANDLERS = {
    "ROUND_ACTIVATE": { required: ["roundId"] },
    "ROUND_ARCHIVE": { required: ["roundId"] },
    "ROUND_RESET": { required: ["roundId"] },
    "ROUND_WIPE": { required: ["roundId"] },
    "TEAM_SYNC": { required: ["roundId"] },
    "RACE_IMPORT": { required: ["roundId"] },
    "RESULTS_SYNC": { required: ["roundId"] },
    "METADATA_SYNC": { required: ["roundId"] }
};

export async function onRequestPost({ request, env }) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };

    try {
        const body = await request.json();
        const { type, payload } = body;

        // 1. Validate Mutation Type
        if (!MUTATION_HANDLERS.hasOwnProperty(type)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "UNKNOWN_MUTATION_TYPE", 
                type,
                available: Object.keys(MUTATION_HANDLERS)
            }), { status: 400, headers: corsHeaders });
        }

        // 2. Validate Payload
        const required = MUTATION_HANDLERS[type].required;
        const missing = required.filter(field => !payload || payload[field] === undefined);
        
        if (missing.length > 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "INVALID_PAYLOAD", 
                required: missing 
            }), { status: 400, headers: corsHeaders });
        }

        // 3. Execution Logic
        console.log(`[MUTATION] Executing: ${type}`, payload);

        if (type === "RESULTS_SYNC") {
            const { roundId, results } = payload;
            const db = env.ZRL_DB;
            const insertStmts = [];

            // 1. Identify the Round in the 2026 schema
            const roundV2 = await db.prepare("SELECT * FROM rounds WHERE id = ?").bind(sanitize(roundId, 'roundId')).first();
            if (!roundV2) {
                return new Response(JSON.stringify({ success: false, error: "ROUND_NOT_FOUND", roundId }), { status: 404, headers: corsHeaders });
            }

            // 2. Find/Create Round Group mapping
            let roundGroup = await db.prepare("SELECT id FROM zrl_round_groups WHERE external_season_id = ?").bind(sanitize(roundV2.wtrl_id, 'wtrl_id')).first();
            if (!roundGroup) {
                await db.prepare("INSERT INTO zrl_round_groups (series_id, round_index, external_season_id, description) VALUES (1, ?, ?, ?)").bind(sanitize(roundV2.round_number, 'round_number'), sanitize(roundV2.wtrl_id, 'wtrl_id'), sanitize(roundV2.name, 'name')).run();
                roundGroup = await db.prepare("SELECT id FROM zrl_round_groups WHERE external_season_id = ?").bind(sanitize(roundV2.wtrl_id, 'wtrl_id')).first();
            }
            const roundGroupId = roundGroup.id;

            // Normalize input
            const itemsToProcess = Array.isArray(results) ? results : [{ 
                key: results.args?.class || results.zrldivision || results.payload?.[0]?.class, 
                data: results 
            }];

            for (const item of itemsToProcess) {
                const rawData = item.data;
                const data = rawData?.payload || rawData;
                const leagueKey = item.key || rawData?.args?.class || rawData?.zrldivision;

                if (!Array.isArray(data) || !leagueKey) continue;

                // Detect if GC or Race
                const isGC = data.length > 0 && data[0].hasOwnProperty('j') && data[0].hasOwnProperty('e');

                if (isGC) {
                    // --- GC STANDINGS LOGIC ---
                    insertStmts.push(db.prepare("DELETE FROM zrl_team_standings WHERE round_group_id = ? AND league_key = ?").bind(sanitize(roundGroupId, 'roundGroupId'), sanitize(leagueKey, 'leagueKey')));

                    for (const team of data) {
                        const teamName = team.d || team.teamname || "Unknown";
                        const isInox = teamName.toUpperCase().includes("INOX");
                        
                        insertStmts.push(db.prepare(`
                            INSERT INTO zrl_team_standings (
                                round_group_id, league_key, team_name, rank, 
                                league_points, pts_fal, pts_fts, pts_finish, total_race_points,
                                r1, r2, r3, r4, r5, r6, r7, r8, is_inox
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `).bind(
                            sanitize(roundGroupId, 'roundGroupId'), sanitize(leagueKey, 'leagueKey'), sanitize(teamName, 'teamName'), sanitize(team.c, 'rank'),
                            sanitize(team.j, 'league_points'), sanitize(team.e, 'pts_fal'), sanitize(team.k, 'pts_fts'), sanitize(team.i, 'pts_finish'), sanitize((parseInt(team.e) || 0), 'total_race_points'),
                            sanitize(team.r1, 'r1'), sanitize(team.r2, 'r2'), sanitize(team.r3, 'r3'), sanitize(team.r4, 'r4'), sanitize(team.r5, 'r5'), sanitize(team.r6, 'r6'), sanitize(team.r7, 'r7'), sanitize(team.r8, 'r8'),
                            sanitize(isInox ? 1 : 0, 'is_inox')
                        ));
                    }
                } else {
                    // --- RACE RESULTS LOGIC ---
                    const raceNum = rawData?.args?.race || roundV2.round_number;
                    const raceName = `Race ${raceNum}`;

                    let zrlRace = await db.prepare("SELECT id FROM zrl_races WHERE zrl_round_group_id = ? AND name = ?").bind(sanitize(roundGroupId, 'roundGroupId'), sanitize(raceName, 'raceName')).first();
                    if (!zrlRace) {
                        await db.prepare("INSERT INTO zrl_races (zrl_round_group_id, name, date) VALUES (?, ?, ?)").bind(sanitize(roundGroupId, 'roundGroupId'), sanitize(raceName, 'raceName'), sanitize(roundV2.starts_at, 'starts_at')).run();
                        zrlRace = await db.prepare("SELECT id FROM zrl_races WHERE zrl_round_group_id = ? AND name = ?").bind(sanitize(roundGroupId, 'roundGroupId'), sanitize(raceName, 'raceName')).first();
                    }
                    const targetRaceId = zrlRace.id;

                    insertStmts.push(db.prepare("DELETE FROM division_results WHERE round_id = ? AND league_key = ?").bind(sanitize(targetRaceId, 'targetRaceId'), sanitize(leagueKey, 'leagueKey')));

                    for (const team of data) {
                        const teamName = team.teamname || team.name || "Unknown Team";
                        const isInoxTeam = teamName.toUpperCase().includes("INOX");
                        const riders = team.a || [];

                        // 1. Insert TEAM SUMMARY record
                        insertStmts.push(db.prepare(`
                            INSERT INTO division_results (
                                round_id, league_key, team_name, rider_name, zwid, 
                                position, time, points_finish, points_fal, points_fts, 
                                points_total, is_inox
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `).bind(
                            sanitize(targetRaceId, 'targetRaceId'), sanitize(leagueKey, 'leagueKey'), sanitize(teamName, 'teamName'), null, null,
                            sanitize(parseInt(team.p1) || null, 'position'), sanitize(parseFloat(team.timeResult) || 0, 'time'),
                            sanitize(parseInt(team.finp) || 0, 'pts_finish'), sanitize(parseInt(team.falp) || 0, 'pts_fal'), sanitize(parseInt(team.ftsp) || 0, 'pts_fts'),
                            sanitize(parseInt(team.totp) || 0, 'points_total'), sanitize(isInoxTeam ? 1 : 0, 'is_inox')
                        ));

                        // 2. Insert individual riders
                        for (const r of riders) {
                            const zwid = parseInt(r.zid || r.zwid || 0);
                            const riderName = r.name || "Unknown Rider";
                            const position = parseInt(r.p1) || null;
                            const time = parseFloat(r.timeResult) || 0;
                            const pts_finish = parseInt(r.finrp) || 0;
                            const pts_fal = parseInt(r.falrp) || 0;
                            const pts_fts = parseInt(r.ftsrp) || 0;
                            const pts_total = parseInt(r.totrp) || 0;

                            insertStmts.push(db.prepare(`
                                INSERT INTO division_results (
                                    round_id, league_key, team_name, rider_name, zwid, 
                                    position, time, points_finish, points_fal, points_fts, 
                                    points_total, is_inox
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                                sanitize(targetRaceId, 'targetRaceId'), sanitize(leagueKey, 'leagueKey'), sanitize(teamName, 'teamName'), sanitize(riderName, 'riderName'), sanitize(zwid, 'zwid'),
                                sanitize(position, 'position'), sanitize(time, 'time'), sanitize(pts_finish, 'pts_finish'), sanitize(pts_fal, 'pts_fal'), sanitize(pts_fts, 'pts_fts'),
                                sanitize(pts_total, 'pts_total'), sanitize(isInoxTeam ? 1 : 0, 'is_inox')
                            ));
                        }
                    }
                }
            }

            if (insertStmts.length > 0) {
                // Batch execution in chunks to avoid limits
                for (let i = 0; i < insertStmts.length; i += 100) {
                    await db.batch(insertStmts.slice(i, i + 100));
                }
            }
        }
        
        return new Response(JSON.stringify({ success: true, type, status: "COMMITTED" }), { headers: corsHeaders });

    } catch (err) {
        console.error(`[MUTATION ERROR]`, err);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "INTERNAL_SERVER_ERROR", 
            message: err.message,
            stack: err.stack 
        }), { status: 500, headers: corsHeaders });
    }
}
