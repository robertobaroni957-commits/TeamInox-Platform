// functions/api/ingest-sauce.js

export async function onRequestPOST({ request, env }) {
  try {
    const body = await request.json();
    const { round_id, athletes: athleteList } = body;

    if (!round_id || !athleteList || !Array.isArray(athleteList)) {
      return new Response(JSON.stringify({ error: "Invalid payload: round_id and athletes array required" }), { status: 400 });
    }

    // Process athletes and results in batches
    const queries = [];

    for (const athlete of athleteList) {
      const { zwid, name, time, points_total, team } = athlete;

      if (!zwid) continue;

      // 1. Upsert athlete (ensure they exist)
      queries.push(
        env.DB.prepare(
          "INSERT OR IGNORE INTO athletes (zwid, name, team) VALUES (?, ?, ?)"
        ).bind(zwid, name, team || null)
      );

      // 2. Upsert result for this round
      queries.push(
        env.DB.prepare(
          "INSERT OR REPLACE INTO results (round_id, zwid, time, points_total, data_source) VALUES (?, ?, ?, ?, ?)"
        ).bind(round_id, zwid, time || 0, points_total || 0, 'sauce_live')
      );
    }

    // Execute all queries in a single transaction (batch)
    if (queries.length > 0) {
      await env.DB.batch(queries);
    }

    return new Response(JSON.stringify({ success: true, processed: athleteList.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Ingest Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
