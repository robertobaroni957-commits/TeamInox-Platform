export async function onRequestGet(context) {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const seasonId = url.searchParams.get("season_id") || 19;

    let query = `SELECT 
      wtrl_team_id,
      wtrl_team_id as id, 
      name, 
      category, 
      division, 
      captain_id, 
      club_id 
    FROM teams
    WHERE season_id = ?`;
    let params = [seasonId];

    query += ` ORDER BY category ASC, division ASC, name ASC`;

    const { results } = await env.ZRL_DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ 
        success: true, 
        teams: results 
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (err) {
    console.error("Errore recupero teams locali:", err.message);
    return new Response(JSON.stringify({ error: err.message, teams: [] }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env, data } = context;
  const user = data?.user;

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden: Admin or Moderator access required" }), { status: 403 });
  }

  try {
    const { name, category, division, wtrl_team_id, captain_id, club_id, season_id } = await request.json();
    const sid = season_id || 19;
    await env.ZRL_DB.prepare(
      "INSERT INTO teams (name, category, division, wtrl_team_id, captain_id, club_id, season_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(name, category, division, wtrl_team_id, captain_id, club_id, sid).run();
    return new Response(JSON.stringify({ success: true, id: wtrl_team_id }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPatch(context) {
  const { request, env, data } = context;
  const user = data?.user;

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const { id, name, category, division, captain_id, club_id, season_id } = await request.json();
    const sid = season_id || 19;
    // 'id' qui è il wtrl_team_id
    await env.ZRL_DB.prepare(
      "UPDATE teams SET name = ?, category = ?, division = ?, captain_id = ?, club_id = ? WHERE wtrl_team_id = ? AND season_id = ?"
    ).bind(name, category, division, captain_id, club_id, id, sid).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const { request, env, data } = context;
  const user = data?.user;

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id"); // wtrl_team_id
  const season_id = url.searchParams.get("season_id") || 19;

  try {
    await env.ZRL_DB.prepare("DELETE FROM teams WHERE wtrl_team_id = ? AND season_id = ?").bind(id, season_id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

