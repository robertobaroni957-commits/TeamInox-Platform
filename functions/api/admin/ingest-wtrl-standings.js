
export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { externalSeasonId, leagueKey, payload } = body;

        if (!externalSeasonId || !leagueKey || !payload) {
            return new Response(JSON.stringify({ error: "Dati mancanti" }), { status: 400 });
        }

        const roundGroup = await env.DB.prepare(`
            SELECT id FROM zrl_round_groups WHERE external_season_id = ? LIMIT 1
        `).bind(externalSeasonId).first();

        if (!roundGroup) {
            return new Response(JSON.stringify({ error: "Round Group non trovato per questo ID WTRL" }), { status: 404 });
        }

        const roundGroupId = roundGroup.id;
        const insertStmts = [];

        insertStmts.push(env.DB.prepare(`DELETE FROM zrl_team_standings WHERE round_group_id = ? AND league_key = ?`).bind(roundGroupId, leagueKey));

        for (const team of payload) {
            const teamName = team.d;
            const isInox = teamName.toUpperCase().includes("INOX");

            insertStmts.push(env.DB.prepare(`
                INSERT INTO zrl_team_standings (
                    round_group_id, league_key, team_name, rank, 
                    league_points, pts_fal, pts_fts, pts_finish,
                    r1, r2, r3, r4, r5, r6, r7, r8, is_inox
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                roundGroupId, leagueKey, teamName, team.c, 
                team.j, team.e, team.k, team.i,
                team.r1, team.r2, team.r3, team.r4, team.r5, team.r6, team.r7, team.r8,
                isInox ? 1 : 0
            ));
        }

        await env.DB.batch(insertStmts);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Classifica GC aggiornata (FAL/FTS inclusi) per ${payload.length} squadre in ${leagueKey}` 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
