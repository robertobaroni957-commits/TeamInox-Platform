export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM teams 
      ORDER BY category ASC, division ASC, name ASC
    `).all();

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
  if (data.user?.role !== 'admin' && data.user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const { name, category, division, wtrl_team_id } = await request.json();
    const result = await env.DB.prepare(
      "INSERT INTO teams (name, category, division, wtrl_team_id) VALUES (?, ?, ?, ?)"
    ).bind(name, category, division, wtrl_team_id).run();
    return new Response(JSON.stringify({ success: true, id: result.meta.lastRowId }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPATCH(context) {
  const { request, env, data } = context;
  if (data.user?.role !== 'admin' && data.user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const { id, name, category, division, wtrl_team_id } = await request.json();
    await env.DB.prepare(
      "UPDATE teams SET name = ?, category = ?, division = ?, wtrl_team_id = ? WHERE id = ?"
    ).bind(name, category, division, wtrl_team_id, id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestDELETE(context) {
  const { request, env, data } = context;
  if (data.user?.role !== 'admin' && data.user?.role !== 'moderator') {
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
