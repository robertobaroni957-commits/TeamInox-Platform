export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    
    if (!data.meta || !data.meta.team) {
      return new Response(JSON.stringify({ error: "Struttura JSON non valida." }), { status: 400 });
    }

    const teamMeta = data.meta.team;
    const compMeta = data.meta.competition || {};
    const trc = parseInt(data.meta.trc || teamMeta.tttid);
    const riders = data.riders || [];

    // 1. Upsert del TEAM
    await env.DB.prepare(`
      INSERT INTO teams (
        wtrl_team_id, name, category, division, tttid, 
        club_id, club_name, gender, league, zrldivision, 
        is_dev, rounds, member_count
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(wtrl_team_id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        division = excluded.division,
        tttid = excluded.tttid,
        club_id = excluded.club_id,
        club_name = excluded.club_name,
        gender = excluded.gender,
        league = excluded.league,
        zrldivision = excluded.zrldivision,
        is_dev = excluded.is_dev,
        rounds = excluded.rounds,
        member_count = excluded.member_count
    `).bind(
      trc,
      teamMeta.name,
      data.meta.category || compMeta.division || '',
      data.meta.division || '',
      parseInt(teamMeta.tttid) || 0,
      compMeta.clubid || '',
      compMeta.clubname || '',
      compMeta.gender || '',
      compMeta.league || '',
      compMeta.division || '', 
      teamMeta.isdev ? 1 : 0,
      JSON.stringify(compMeta.registered || []),
      parseInt(data.meta.memberCount) || 0
    ).run();

    const teamRecord = await env.DB.prepare("SELECT id FROM teams WHERE wtrl_team_id = ?").bind(trc).first();
    const internalTeamId = teamRecord.id;

    const statements = [];
    statements.push(env.DB.prepare(`DELETE FROM team_members WHERE team_id = ?`).bind(internalTeamId));

    for (const r of riders) {
      // IMPORTANTE: Su WTRL profileId è lo Zwift ID (numero), userId è il WTRL ID (UUID)
      const zwid = parseInt(r.profileId); 
      if (!zwid) continue;

      statements.push(env.DB.prepare(`
        INSERT INTO athletes (
          zwid, name, role, base_category, avatar_url, 
          zftp, zftpw, zmap, zmapw, profile_id, wtrl_user_id
        )
        VALUES (?, ?, 'athlete', ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(zwid) DO UPDATE SET 
          name = excluded.name,
          base_category = excluded.base_category,
          avatar_url = excluded.avatar_url,
          zftp = excluded.zftp,
          zftpw = excluded.zftpw,
          zmap = excluded.zmap,
          zmapw = excluded.zmapw,
          profile_id = excluded.profile_id,
          wtrl_user_id = excluded.wtrl_user_id
      `).bind(
        zwid, 
        r.name || '', 
        r.category || 'X', 
        r.avatar || '',
        parseFloat(r.zftp) || 0,
        parseInt(r.zftpw) || 0,
        parseFloat(r.zmap) || 0,
        parseInt(r.zmapw) || 0,
        zwid,
        String(r.userId || '')
      ));

      statements.push(env.DB.prepare(`
        INSERT INTO team_members (team_id, athlete_id)
        VALUES (?, ?)
      `).bind(internalTeamId, zwid));
    }

    if (statements.length > 0) {
      await env.DB.batch(statements);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      team: teamMeta.name,
      riders_synced: riders.length 
    }));

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
