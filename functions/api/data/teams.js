export async function onRequestGet({ env }) {
  try {
    const { results } = await env.ZRL_DB.prepare(
      "SELECT * FROM teams ORDER BY name ASC"
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
