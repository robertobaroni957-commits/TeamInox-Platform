// functions/api/admin/winter-tour/scoring-rules.js

export async function onRequestPost(context) {
  const { request, env, data } = context;

  // 1. Authorize User
  const user = data?.user;
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return new Response(JSON.stringify({ error: "Forbidden: Unauthorized access" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const rules = await request.json();

    if (!Array.isArray(rules)) {
      return new Response(JSON.stringify({ error: "Rules must be an array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const db = env.WINTER_TOUR_DB;
    const statements = rules.map(rule => {
      return db.prepare(
        "INSERT OR REPLACE INTO wt_scoring_rules (type, position, points) VALUES (?, ?, ?)"
      ).bind(rule.type, parseInt(rule.position), parseInt(rule.points));
    });

    if (statements.length > 0) {
      await db.batch(statements);
    }

    return new Response(JSON.stringify({ success: true, count: rules.length }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
