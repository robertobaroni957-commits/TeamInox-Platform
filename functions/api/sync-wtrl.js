export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { seasonId, teamId } = await request.json();

    if (!seasonId || !teamId) {
      return new Response(JSON.stringify({ error: "Dati mancanti (seasonId o teamId)" }), { status: 400 });
    }

    // Costruiamo l'URL WTRL
    const wtrlUrl = `https://www.wtrl.racing/api/zrl/${seasonId}/teams/${teamId}`;

    // Recuperiamo il cookie di sessione dalle variabili d'ambiente (definite in .dev.vars)
    // NOTA: Senza questo, WTRL risponderà 401
    const wtrlCookie = env.WTRL_COOKIE || "";

    console.log(`Richiesta a WTRL per Team ${teamId}, Stagione ${seasonId}...`);

    const response = await fetch(wtrlUrl, {
      headers: {
        "accept": "application/json",
        "cookie": wtrlCookie,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ 
        error: `Errore WTRL: ${response.status}`, 
        detail: errorText 
      }), { status: response.status });
    }

    const data = await response.json();
    const members = data.riders || data.members || []; 
    
    // Recuperiamo l'ID interno del team
    const teamRecord = await env.DB.prepare("SELECT id FROM teams WHERE wtrl_team_id = ?").bind(teamId).first();
    if (!teamRecord) {
      return new Response(JSON.stringify({ error: `Team con ID WTRL ${teamId} non trovato nel database locale. Sincronizza prima le squadre.` }), { status: 404 });
    }
    const internalTeamId = teamRecord.id;

    const statements = [];
    // Pulizia roster attuale per questo team
    statements.push(env.DB.prepare(`DELETE FROM team_members WHERE team_id = ?`).bind(internalTeamId));

    for (const m of members) {
      const zwid = parseInt(m.profileId || m.zwiftId || m.zwid);
      if (!zwid) continue;

      // 1. Upsert Atleta con dati estesi
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
        m.name, 
        m.category || '', 
        m.avatar || '',
        parseFloat(m.zftp) || 0,
        parseInt(m.zftpw) || 0,
        parseFloat(m.zmap) || 0,
        parseInt(m.zmapw) || 0,
        parseInt(m.profileId) || null,
        m.userId || ''
      ));

      // 2. Inserimento nel Roster
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
      message: `Sincronizzati ${members.length} atleti per il team ${data.meta?.team?.name || teamId}`,
      count: members.length
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
