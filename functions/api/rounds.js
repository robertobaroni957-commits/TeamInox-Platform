export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const series_id = url.searchParams.get("series_id");

  if (!env.DB) return new Response("DB non trovato", { status: 500 });

  try {
    let query = "SELECT * FROM rounds";
    let params = [];

    if (series_id) {
      query += " WHERE series_id = ?";
      params.push(series_id);
    }
    
    query += " ORDER BY date ASC, id ASC";

    const results = await env.DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(results.results || []), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
