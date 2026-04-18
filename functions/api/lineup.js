// functions/api/lineup.js
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const round_id = url.searchParams.get("round_id");
  const team_id = url.searchParams.get("team_id");

  try {
    let query = `
      SELECT rl.*, ath.name as athlete_name, t.name as team_name
      FROM race_lineup rl
      JOIN athletes ath ON rl.athlete_id = ath.zwid
      JOIN teams t ON rl.team_id = t.id
      WHERE 1=1
    `;
    let params = [];

    if (round_id) {
      query += " AND rl.round_id = ?";
      params.push(round_id);
    }
    if (team_id) {
      query += " AND rl.team_id = ?";
      params.push(team_id);
    }

    const { results } = await env.DB.prepare(query).bind(...params).all();
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
    const { round_id, team_id, athlete_id, role, status } = await request.json();
    // TODO: Se Captain, verificare che team_id appartenga a lui
    await env.DB.prepare(`
      INSERT INTO race_lineup (round_id, team_id, athlete_id, role, status)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(round_id, team_id, athlete_id) DO UPDATE SET
        role = excluded.role,
        status = excluded.status
    `).bind(round_id, team_id, athlete_id, role || 'starter', status || 'confirmed').run();

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
    return new Response(JSON.stringify({ error: "Forbidden: Admin, Moderator, or Captain access required" }), { status: 403 });
  }

  try {
    const { round_id, team_id, athlete_id } = await request.json();
    // TODO: Se Captain, verificare che team_id appartenga a lui
    await env.DB.prepare(`
      DELETE FROM race_lineup 
      WHERE round_id = ? AND team_id = ? AND athlete_id = ?
    `).bind(round_id, team_id, athlete_id).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
