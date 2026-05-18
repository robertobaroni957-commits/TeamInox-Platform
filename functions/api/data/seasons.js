export async function onRequestGet({ env }) {
  try {
    const { results } = await env.ZRL_DB.prepare(
      "SELECT id, name, external_season_id, is_active FROM series ORDER BY id DESC"
    ).all();
    
    // Mapping legacy table to zrl_seasons structure if needed, or returning as is.
    // For now, we return series data as seasons.
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
