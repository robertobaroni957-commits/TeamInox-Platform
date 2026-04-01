// /functions/api/series.ts

export async function onRequestGET({ env }) {
  try {
    // Recupera tutte le series con conteggio dei round
    const { results } = await env.DB.prepare(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM rounds r WHERE r.series_id = s.id) AS total_rounds
      FROM series s
      ORDER BY id DESC
    `).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPOST({ request, env }) {
  try {
    const body = await request.json();
    const { name, external_season_id, scoring_type, is_active } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: "Missing 'name'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare(`
      INSERT INTO series (name, external_season_id, scoring_type, is_active)
      VALUES (?, ?, ?, ?)
    `).bind(name, external_season_id || null, scoring_type || null, is_active ? 1 : 0).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPATCH({ request, env }) {
  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (typeof id === "undefined") {
      return new Response(JSON.stringify({ error: "Missing 'id'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare(`
      UPDATE series SET is_active = ? WHERE id = ?
    `).bind(is_active ? 1 : 0, id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}