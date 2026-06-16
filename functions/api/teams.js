export async function onRequestGet(context) {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const seasonId = url.searchParams.get("season_id");
    const seasonCode = url.searchParams.get("season_code") || 'zrl_25_26';

    let query = `SELECT 
      wtrl_team_id,
      wtrl_team_id as id, 
      name, 
      category, 
      division, 
      captain_id, 
      club_id 
    FROM teams`;
    
    let params = [];
    if (seasonId) {
      query += ` WHERE season_id = ?`;
      params.push(seasonId);
    } else {
      query += ` WHERE season_code = ?`;
      params.push(seasonCode);
    }

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
    const { name, category, division, wtrl_team_id, captain_id, club_id, season_id, season_code } = await request.json();
    const sid = season_id || 19;
    const sc = season_code || 'zrl_25_26';
    await env.ZRL_DB.prepare(
      "INSERT INTO teams (name, category, division, wtrl_team_id, captain_id, club_id, season_id, season_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(name, category, division, wtrl_team_id, captain_id, club_id, sid, sc).run();
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
    const { id, name, category, division, captain_id, club_id, season_id, season_code } = await request.json();
    const sid = season_id || 19;
    const sc = season_code || 'zrl_25_26';
    // 'id' qui è il wtrl_team_id
    await env.ZRL_DB.prepare(
      "UPDATE teams SET name = ?, category = ?, division = ?, captain_id = ?, club_id = ?, season_id = ?, season_code = ? WHERE wtrl_team_id = ?"
    ).bind(name, category, division, captain_id, club_id, sid, sc, id).run();
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

  try {
    await env.ZRL_DB.prepare("DELETE FROM teams WHERE wtrl_team_id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
