export async function onRequestGet(context) {
  const { env, data } = context;
  const user = data?.user;

  if (!user || user.role === 'guest') {
    return new Response(JSON.stringify({ missing: false }));
  }

  try {
    // 1. Verifichiamo se ha espresso almeno una preferenza oraria (livello 1 o 2)
    const prefs = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_time_preferences WHERE zwid = ? AND preference_level >= 1
    `).bind(user.zwid).first();

    // 2. Verifichiamo se ha risposto ad almeno un round della serie attiva
    const rsvp = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM availability 
      WHERE athlete_id = ? 
      AND round_id IN (SELECT id FROM rounds WHERE series_id = (SELECT id FROM series WHERE is_active = 1 LIMIT 1))
    `).bind(user.zwid).first();

    const isMissing = (prefs.count === 0 || rsvp.count === 0);

    return new Response(JSON.stringify({ 
      success: true, 
      missing: isMissing,
      details: {
        prefs: prefs.count,
        rsvp: rsvp.count
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
