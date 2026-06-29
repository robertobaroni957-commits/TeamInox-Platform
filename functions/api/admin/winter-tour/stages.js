// functions/api/admin/winter-tour/stages.js

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
    const body = await request.json();
    const { 
      action, id, stage_number, date, 
      world_it, world_en, route_it, route_en, 
      type_it, type_en, route_link, register_link, 
      zwift_event_id, segments, status 
    } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: "Action is required ('create' or 'update')" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const db = env.WINTER_TOUR_DB;

    if (action === 'create') {
      const segmentsJson = JSON.stringify(segments || []);
      const result = await db.prepare(`
        INSERT INTO wt_stages (
          stage_number, date, world_it, world_en, route_it, route_en, 
          type_it, type_en, route_link, register_link, zwift_event_id, 
          segments, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        parseInt(stage_number), date, world_it, world_en, route_it, route_en,
        type_it, type_en, route_link || "", register_link || "", parseInt(zwift_event_id),
        segmentsJson, status || 'scheduled'
      ).run();

      return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
        headers: { "Content-Type": "application/json" }
      });

    } else if (action === 'update') {
      if (!id) {
        return new Response(JSON.stringify({ error: "Stage ID is required for update" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const segmentsJson = JSON.stringify(segments || []);
      await db.prepare(`
        UPDATE wt_stages SET 
          stage_number = ?, date = ?, world_it = ?, world_en = ?, 
          route_it = ?, route_en = ?, type_it = ?, type_en = ?, 
          route_link = ?, register_link = ?, zwift_event_id = ?, 
          segments = ?, status = ?
        WHERE id = ?
      `).bind(
        parseInt(stage_number), date, world_it, world_en, route_it, route_en,
        type_it, type_en, route_link || "", register_link || "", parseInt(zwift_event_id),
        segmentsJson, status, parseInt(id)
      ).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: `Unsupported action: ${action}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestDelete(context) {
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
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Stage ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const db = env.WINTER_TOUR_DB;

    // Delete stage (results will be deleted automatically due to ON DELETE CASCADE)
    await db.prepare("DELETE FROM wt_stages WHERE id = ?").bind(parseInt(id)).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
