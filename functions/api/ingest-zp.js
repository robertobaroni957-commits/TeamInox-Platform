// functions/api/ingest-zp.js
export async function onRequestPOST({ request, env }) {
  try {
    const { round_id, race_results } = await request.json();

    if (!round_id || !race_results || !Array.isArray(race_results)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    const queries = race_results.map(r => {
      // Mapping ZwiftPower JSON fields to D1 schema
      // pts_sprint usually maps to FAL in ZRL context for sprints
      // pts_kom maps to FAL for climbs
      // fin maps to finishing points
      const fal = (r.pts_sprint || 0) + (r.pts_kom || 0);
      const fts = r.fts_points || 0; // Assuming fts_points exists in our parsed JSON
      const fin = r.fin || 0;
      const total = fal + fts + fin;

      return env.DB.prepare(`
        INSERT OR REPLACE INTO results (round_id, zwid, time, points_total, points_fal, points_fts, points_fin, data_source)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'zwiftpower')
      `).bind(round_id, r.zwid, r.time, total, fal, fts, fin);
    });

    if (queries.length > 0) {
      await env.DB.batch(queries);
    }

    return new Response(JSON.stringify({ success: true, count: race_results.length }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
