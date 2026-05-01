// functions/api/admin/winter-tour.js
export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const series_id = url.searchParams.get("series_id");

  if (!series_id) {
    // Ritorna tutte le serie di tipo Winter Tour
    const { results } = await env.DB.prepare(
      "SELECT * FROM series WHERE name LIKE '%Winter Tour%' ORDER BY start_date DESC"
    ).all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  }

  try {
    const [points, rounds] = await Promise.all([
      env.DB.prepare("SELECT * FROM winter_tour_points WHERE series_id = ? ORDER BY position ASC").bind(series_id).all(),
      env.DB.prepare("SELECT * FROM rounds WHERE series_id = ? ORDER BY date ASC").bind(series_id).all()
    ]);

    return new Response(JSON.stringify({
      points: points.results,
      rounds: rounds.results
    }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { action, payload } = await request.json();

    if (action === "create_series") {
      const { name, start_date, end_date } = payload;
      const result = await env.DB.prepare(
        "INSERT INTO series (name, start_date, end_date, is_active) VALUES (?, ?, ?, 1)"
      ).bind(name, start_date, end_date).run();
      return new Response(JSON.stringify({ success: true, id: result.meta.lastRowId }));
    }

    if (action === "update_points") {
      const { series_id, point_map } = payload; // point_map: [{position: 1, points: 100}, ...]
      
      const statements = [
        env.DB.prepare("DELETE FROM winter_tour_points WHERE series_id = ?").bind(series_id)
      ];
      
      point_map.forEach(p => {
        statements.push(
          env.DB.prepare("INSERT INTO winter_tour_points (series_id, position, points) VALUES (?, ?, ?)")
            .bind(series_id, p.position, p.points)
        );
      });

      await env.DB.batch(statements);
      return new Response(JSON.stringify({ success: true }));
    }

    return new Response(JSON.stringify({ error: "Action not recognized" }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
