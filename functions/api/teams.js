export async function onRequestGet(context) {
  const { env, data } = context;
  const user = data?.user;

  try {
    let query = `SELECT id, name, category, division, division_number, captain_id, wtrl_team_id, club_id, race_pass_url FROM teams`;
    let params = [];

    // Admin e Moderator vedono tutto (nessun filtro)
    // Se non c'è user (Guest o errore auth silenziato), mostriamo comunque tutto per sbloccare la UI
    if (!user || user.role === 'admin' || user.role === 'moderator') {
      // Nessun filtro
    } else if (user.role === 'captain') {
      query += ` WHERE captain_id = ?`;
      params.push(user.zwid);
    } else if (user.role === 'user') {
      const athlete = await env.DB.prepare(`SELECT team_id FROM athletes WHERE zwid = ?`).bind(user.zwid).first();
      if (athlete?.team_id) {
        query += ` WHERE id = ?`;
        params.push(athlete.team_id);
      } else {
        return new Response(JSON.stringify({ success: true, teams: [] }), { headers: { "Content-Type": "application/json" } });
      }
    }

    query += ` ORDER BY category ASC, division ASC, name ASC`;

    const { results } = await env.DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ 
        success: true, 
        teams: results 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Errore recupero teams locali:", err.message);
    return new Response(JSON.stringify({ error: err.message, teams: [] }), { status: 500 });
  }
}

export async function onRequestPOST(context) {
  const { request, env, data } = context;
  const user = data?.user;

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden: Admin or Moderator access required" }), { status: 403 });
  }

  try {
    const { name, category, division, wtrl_team_id, captain_id, club_id } = await request.json();
    const result = await env.DB.prepare(
      "INSERT INTO teams (name, category, division, wtrl_team_id, captain_id, club_id) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(name, category, division, wtrl_team_id, captain_id, club_id).run();
    return new Response(JSON.stringify({ success: true, id: result.meta.lastRowId }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPATCH(context) {
  const { request, env, data } = context;
  const user = data?.user;

  // Un capitano può modificare solo le sue squadre (es. cambiare nome se permesso o altre info minori)
  // Per ora limitiamo la modifica strutturale a Admin/Moderator
  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const { id, name, category, division, wtrl_team_id, captain_id, club_id } = await request.json();
    await env.DB.prepare(
      "UPDATE teams SET name = ?, category = ?, division = ?, wtrl_team_id = ?, captain_id = ?, club_id = ? WHERE id = ?"
    ).bind(name, category, division, wtrl_team_id, captain_id, club_id, id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestDELETE(context) {
  const { request, env, data } = context;
  const user = data?.user;

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  try {
    await env.DB.prepare("DELETE FROM teams WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
