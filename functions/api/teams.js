export async function onRequestGet(context) {
  const { env, data } = context;
  const user = data?.user;

  try {
    let query = `SELECT * FROM teams`;
    let params = [];

    // Se l'utente è un Capitano, vede solo le sue squadre
    if (user && user.role === 'captain') {
      query += ` WHERE captain_id = ?`;
      params.push(user.zwid);
    } 
    // Se è un utente semplice (atleta), vede solo la sua squadra
    else if (user && user.role === 'user') {
      // Dobbiamo prima trovare il team_id dell'atleta
      const athlete = await env.DB.prepare(`SELECT team_id FROM athletes WHERE zwid = ?`).bind(user.zwid).first();
      if (athlete?.team_id) {
        query += ` WHERE id = ?`;
        params.push(athlete.team_id);
      } else {
        // Se non ha squadra, non vede nulla
        return new Response(JSON.stringify({ success: true, teams: [] }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    // Admin e Moderator vedono tutto (nessun filtro)

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
