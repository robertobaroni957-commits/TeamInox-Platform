// functions/api/admin/winter-tour.js
export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const series_id = url.searchParams.get("series_id");

  if (!series_id) {
    // Ritorna tutte le serie di tipo Winter Tour (Legacy Read)
    const { results } = await env.ZRL_DB.prepare(
      "SELECT * FROM series WHERE name LIKE '%Winter Tour%' ORDER BY start_date DESC"
    ).all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  }

  try {
    const [points, rounds] = await Promise.all([
      env.ZRL_DB.prepare("SELECT * FROM winter_tour_points WHERE series_id = ? ORDER BY position ASC").bind(series_id).all(),
      env.ZRL_DB.prepare("SELECT * FROM rounds WHERE series_id = ? ORDER BY date ASC").bind(series_id).all()
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
  // ❄️ FREEZE V1: Disabilitiamo la creazione di nuove serie legacy in produzione
  return new Response(JSON.stringify({ 
    error: "Forbidden: Legacy write operations are frozen. Use V3 Management instead.",
    code: "V1_FREEZE"
  }), { status: 403, headers: { "Content-Type": "application/json" } });
}
