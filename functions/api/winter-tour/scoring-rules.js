// functions/api/winter-tour/scoring-rules.js

export async function onRequestGet({ env }) {
  try {
    if (!env.WINTER_TOUR_DB) {
      return new Response(JSON.stringify({ error: "WINTER_TOUR_DB binding missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { results } = await env.WINTER_TOUR_DB.prepare(
      "SELECT * FROM wt_scoring_rules ORDER BY type ASC, position ASC"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
