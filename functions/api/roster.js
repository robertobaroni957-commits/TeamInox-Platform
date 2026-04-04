export async function onRequestGet(context) {
  const { env, request, data } = context;
  const user = data?.user;
  const url = new URL(request.url);
  const team_id = url.searchParams.get("team_id");
  const round_id = url.searchParams.get("round_id");

  if (!team_id) {
    return new Response(JSON.stringify({ error: "Missing team_id" }), { status: 400 });
  }

  try {
    // Se l'utente è un Capitano, verifichiamo che possa gestire questo team
    if (user && user.role === 'captain') {
      const team = await env.DB.prepare(`SELECT captain_id FROM teams WHERE id = ?`).bind(team_id).first();
      if (!team || team.captain_id !== user.zwid) {
        return new Response(JSON.stringify({ error: "Forbidden: You are not the captain of this team" }), { status: 403 });
      }
    }

    // Recuperiamo tutti gli atleti del roster tramite team_members (M-M)
    // Se round_id è fornito, includiamo anche lo stato di disponibilità
    let query = `
      SELECT a.zwid, a.name, a.base_category as category, a.role, a.avatar_url
    `;
    let params = [team_id];

    if (round_id) {
      query += `, (SELECT status FROM availability WHERE athlete_id = a.zwid AND round_id = ?) as availability_status `;
      params.unshift(round_id); // Inseriamo round_id come primo parametro
    }

    query += `
      FROM athletes a
      JOIN team_members tm ON a.zwid = tm.athlete_id
      WHERE tm.team_id = ?
      ORDER BY a.name ASC
    `;

    const { results } = await env.DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ 
      success: true, 
      roster: results 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Errore recupero roster:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env, data } = context;
  const user = data?.user;

  if (!user || (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'captain')) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const { athlete_zwid, team_id } = await request.json();

    if (!athlete_zwid || !team_id) {
      return new Response(JSON.stringify({ error: "Missing athlete_zwid or team_id" }), { status: 400 });
    }

    if (user.role === 'captain') {
      const team = await env.DB.prepare(`SELECT captain_id FROM teams WHERE id = ?`).bind(team_id).first();
      if (!team || team.captain_id !== user.zwid) {
        return new Response(JSON.stringify({ error: "Forbidden: You can only manage your own teams" }), { status: 403 });
      }
    }

    // Verifichiamo il limite del roster (max 12)
    const count = await env.DB.prepare(`SELECT COUNT(*) as total FROM team_members WHERE team_id = ?`).bind(team_id).first();
    if (count.total >= 12) {
      return new Response(JSON.stringify({ error: "Roster is full (max 12 riders)" }), { status: 400 });
    }

    // Aggiungiamo l'atleta al roster (Many-to-Many)
    await env.DB.prepare(`
      INSERT OR IGNORE INTO team_members (team_id, athlete_id)
      VALUES (?, ?)
    `).bind(team_id, athlete_zwid).run();

    return new Response(JSON.stringify({ success: true, message: "Athlete assigned to roster" }));

  } catch (err) {
    console.error("Errore assegnazione roster:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
