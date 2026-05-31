// functions/api/lineup.js
export async function onRequestGet(context) {
  const { request, env, data } = context;
  const user = data?.user;
  const url = new URL(request.url);
  const round_id = url.searchParams.get("round_id");
  const race_id = url.searchParams.get("race_id");
  const team_id = url.searchParams.get("team_id");

  try {
    // SECURITY: Ensure athlete can only view their own team(s) lineup unless admin/moderator/captain
    if (team_id && user?.role !== 'admin' && user?.role !== 'moderator' && user?.role !== 'captain') {
      const membership = await env.ZRL_DB.prepare(
        "SELECT 1 FROM team_members WHERE team_id = ? AND athlete_id = ?"
      ).bind(team_id, user.zwid).first();

      if (!membership) {
        return new Response(JSON.stringify({ error: "Forbidden: Not a member of this team" }), { status: 403 });
      }
    }

    let query = `
      SELECT rl.*, ath.name as athlete_name, ath.avatar_url as athlete_avatar, t.name as team_name
      FROM race_lineup rl
      JOIN athletes ath ON rl.athlete_id = ath.zwid
      JOIN teams t ON rl.team_id = t.wtrl_team_id
      WHERE 1=1
    `;
    let params = [];

    if (round_id) {
      query += " AND rl.round_id = ?";
      params.push(round_id);
    }
    if (race_id) {
      query += " AND rl.race_id = ?";
      params.push(race_id);
    }
    if (team_id) {
      query += " AND rl.team_id = ?";
      params.push(team_id);
    }

    const { results } = await env.ZRL_DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env, data } = context;
  const user = data?.user;

  if (!user || (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'captain')) {
    return new Response(JSON.stringify({ error: "Forbidden: Admin, Moderator, or Captain access required" }), { status: 403 });
  }

  try {
    const { round_id, race_id, team_id, athlete_id, role, status } = await request.json();
    
    // Validate unique constraint fields
    if (!round_id || !race_id || !athlete_id) {
        return new Response(JSON.stringify({ error: "round_id, race_id, and athlete_id are required" }), { status: 400 });
    }

    await env.ZRL_DB.prepare(`
      INSERT INTO race_lineup (round_id, race_id, team_id, athlete_id, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(round_id, race_id, athlete_id) DO UPDATE SET
        team_id = excluded.team_id,
        role = excluded.role,
        status = excluded.status
    `).bind(round_id, race_id, team_id, athlete_id, role || 'starter', status || 'confirmed').run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPatch(context) {
  return onRequestPost(context);
}

export async function onRequestDelete(context) {
  const { request, env, data } = context;
  const user = data?.user;

  if (!user || (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'captain')) {
    return new Response(JSON.stringify({ error: "Forbidden: Admin, Moderator, or Captain access required" }), { 
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();
    const { round_id, race_id, team_id, athlete_id } = body;
    
    if (!round_id || !athlete_id) {
      return new Response(JSON.stringify({ error: "Missing required fields: round_id, athlete_id" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    let query = "DELETE FROM race_lineup WHERE round_id = ? AND athlete_id = ?";
    let params = [round_id, athlete_id];

    if (race_id) {
        query += " AND race_id = ?";
        params.push(race_id);
    }
    if (team_id) {
        query += " AND team_id = ?";
        params.push(team_id);
    }

    const result = await env.ZRL_DB.prepare(query).bind(...params).run();

    return new Response(JSON.stringify({ success: true, meta: result.meta }), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

