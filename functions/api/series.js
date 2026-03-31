export async function onRequestGET({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT s.*, (SELECT COUNT(*) FROM rounds r WHERE r.series_id = s.id) as total_rounds FROM series s ORDER BY id DESC"
    ).all();
    return new Response(JSON.stringify(results), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPOST({ request, env }) {
  try {
    const { name, external_season_id, scoring_type, is_active } = await request.json();
    await env.DB.prepare(
      "INSERT INTO series (name, external_season_id, scoring_type, is_active) VALUES (?, ?, ?, ?)"
    ).bind(name, external_season_id, scoring_type, is_active ? 1 : 0).run();
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPATCH({ request, env }) {
  try {
    const { id, is_active } = await request.json();
    await env.DB.prepare(
      "UPDATE series SET is_active = ? WHERE id = ?"
    ).bind(is_active ? 1 : 0, id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
