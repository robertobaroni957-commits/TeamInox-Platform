export async function onRequestGet({ env }) {
  if (!env.DB) return new Response("DB non trovato", { status: 500 });
  try {
    const { results } = await env.DB.prepare("SELECT * FROM series ORDER BY id DESC").all();
    return new Response(JSON.stringify(results || []), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
