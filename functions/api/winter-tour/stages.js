// functions/api/winter-tour/stages.js

export async function onRequestGet({ env }) {
  try {
    if (!env.WINTER_TOUR_DB) {
      return new Response(JSON.stringify({ error: "WINTER_TOUR_DB binding missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { results } = await env.WINTER_TOUR_DB.prepare(
      "SELECT * FROM wt_stages ORDER BY stage_number ASC"
    ).all();

    const parsedStages = results.map(stage => {
      let segments = [];
      try {
        segments = JSON.parse(stage.segments || "[]");
      } catch (e) {
        segments = [];
      }

      return {
        id: stage.id,
        stage_number: stage.stage_number,
        date: stage.date,
        world: { it: stage.world_it, en: stage.world_en },
        route: { it: stage.route_it, en: stage.route_en },
        type: { it: stage.type_it, en: stage.type_en },
        routeLink: stage.route_link || "",
        registerLink: stage.register_link || "",
        zwift_event_id: stage.zwift_event_id,
        segments: segments,
        status: stage.status
      };
    });

    return new Response(JSON.stringify(parsedStages), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
