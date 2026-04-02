// functions/api/results.js

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const round_id = url.searchParams.get("round_id");

  if (!round_id) {
    return new Response(JSON.stringify({ error: "Missing round_id parameter" }), { status: 400 });
  }

  try {
    const { results } = await env.DB.prepare(`
      SELECT r.round_id, r.zwid, a.name, a.team, r.time, r.points_total, r.data_source 
      FROM results r
      JOIN athletes a ON r.zwid = a.zwid
      WHERE r.round_id = ?
      ORDER BY r.points_total DESC, r.time ASC
    `).bind(round_id).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
