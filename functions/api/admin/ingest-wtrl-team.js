export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    
    if (!data.meta || !data.meta.team) {
      return new Response(JSON.stringify({ error: "Struttura JSON non valida." }), { status: 400 });
    }

    const teamMeta = data.meta.team;
    const compMeta = data.meta.competition || {};
    const trc = parseInt(data.meta.trc || teamMeta.teamid || teamMeta.tttid);
    const riders = data.riders || [];

    // Parsing avanzato della classe (es: 2370C30 -> League 23, Div 3)
    const leagueKey = compMeta.class || '';
    let league = compMeta.league || '';
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

    const category = data.meta.category || compMeta.division || '';
    const division = data.meta.division || '';
    
    // Estrazione Capitano
    const administrators = data.meta.administrators || {};
    const captain = administrators.captain || {};
    const captain_id = captain.profileId ? parseInt(captain.profileId) : null;

    // 0. PULIZIA: Rimuoviamo eventuali team "fantasma" con lo stesso nome ma senza ID WTRL
    // Questo evita di avere duplicati (uno con dati e uno vuoto) nel database.
    await env.DB.prepare(`
        DELETE FROM teams 
        WHERE name = ? AND (wtrl_team_id IS NULL OR wtrl_team_id = 0)
    `).bind(teamMeta.name).run();

    // 1. Upsert del TEAM
    await env.DB.prepare(`
      INSERT INTO teams (
        wtrl_team_id, name, category, division, division_number, tttid, 
        club_id, club_name, gender, league, zrldivision, 
        is_dev, rounds, member_count, captain_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(wtrl_team_id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        division = excluded.division,
        division_number = excluded.division_number,
        tttid = excluded.tttid,
        club_id = excluded.club_id,
        club_name = excluded.club_name,
        gender = excluded.gender,
        league = excluded.league,
        zrldivision = excluded.zrldivision,
        is_dev = excluded.is_dev,
        rounds = excluded.rounds,
        member_count = excluded.member_count,
        captain_id = excluded.captain_id
    `).bind(
      trc,
      teamMeta.name,
      category,
      division,
      divNum,
      parseInt(teamMeta.tttid) || 0,
      compMeta.clubid || '',
      compMeta.clubname || '',
      compMeta.gender || '',
      league,
      compMeta.division || '', 
      teamMeta.isdev ? 1 : 0,
      JSON.stringify(compMeta.registered || []),
      parseInt(data.meta.memberCount) || 0,
      captain_id
    ).run();

    // Recuperiamo l'ID interno per il collegamento dei membri
    const teamRecord = await env.DB.prepare("SELECT id FROM teams WHERE wtrl_team_id = ?").bind(trc).first();
    const internalTeamId = teamRecord.id;

    const statements = [];
    
    // Se c'è un capitano, assicuriamoci che sia nella tabella athletes
    if (captain_id) {
      statements.push(env.DB.prepare(`
        INSERT INTO athletes (zwid, name, role, profile_id, wtrl_user_id)
        VALUES (?, ?, 'captain', ?, ?)
        ON CONFLICT(zwid) DO UPDATE SET
          name = CASE WHEN athletes.name = '' OR athletes.name IS NULL THEN excluded.name ELSE athletes.name END,
          role = CASE WHEN athletes.role = 'athlete' THEN 'captain' ELSE athletes.role END
      `).bind(
        captain_id, 
        `${captain.firstName || ''} ${captain.lastName || ''}`.trim() || 'Captain',
        captain_id,
        captain.userId || ''
      ));
    }
    // Pulizia membri esistenti per questo team per evitare duplicati o residui
    statements.push(env.DB.prepare(`DELETE FROM team_members WHERE team_id = ?`).bind(internalTeamId));

    for (const r of riders) {
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
    console.error("Errore importazione team:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
