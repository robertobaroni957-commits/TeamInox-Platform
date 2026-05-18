export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const seasonId = url.searchParams.get("seasonId");
    
    if (!seasonId) {
      return new Response(JSON.stringify({ error: "seasonId is required" }), { status: 400 });
    }

    const { results } = await env.ZRL_DB.prepare(
      "SELECT * FROM rounds WHERE series_id = ? ORDER BY date ASC"
    ).bind(seasonId).all();
    
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
