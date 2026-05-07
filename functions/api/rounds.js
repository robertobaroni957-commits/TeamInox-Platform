
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const series_id = url.searchParams.get("series_id");

  if (!env.DB) return new Response("DB non trovato", { status: 500 });

  try {
    let query = `
      SELECT r.* 
      FROM zrl_races r
      JOIN zrl_round_groups rg ON r.zrl_round_group_id = rg.id
    `;
    let params = [];

    if (series_id) {
      query += " WHERE rg.series_id = ?";
      params.push(series_id);
    }
    
    query += " ORDER BY r.date ASC, r.id ASC";

    const { results } = await env.DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify({ rounds: results }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
