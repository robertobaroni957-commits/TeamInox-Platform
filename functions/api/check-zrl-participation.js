export async function onRequestGet(context) {
  const { env, data } = context;
  const user = data?.user;

  if (!user || !user.zwid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // Check if the user is in ANY active ZRL team
    const { results } = await env.ZRL_DB.prepare(`
      SELECT 1 
      FROM team_members 
      WHERE athlete_id = ? AND is_active = 1
    `).bind(user.zwid).all();

    return new Response(JSON.stringify({ 
      isZRLParticipant: results.length > 0 
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
