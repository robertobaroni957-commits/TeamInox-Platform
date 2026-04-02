export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM inox_events WHERE is_active = 1 ORDER BY CASE day_of_week WHEN 'Lunedì' THEN 1 WHEN 'Martedì' THEN 2 WHEN 'Mercoledì' THEN 3 WHEN 'Giovedì' THEN 4 WHEN 'Venerdì' THEN 5 WHEN 'Sabato' THEN 6 WHEN 'Domenica' THEN 7 END, time ASC"
    ).all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPOST({ request, env, data }) {
  // Check for admin role (context data populated by middleware)
  if (data.user?.role !== 'admin' && data.user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden: Admin or Moderator access required" }), { status: 403 });
  }

  try {
    const { name, day_of_week, time, description, zwift_link, category } = await request.json();
    const result = await env.DB.prepare(
      "INSERT INTO inox_events (name, day_of_week, time, description, zwift_link, category) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(name, day_of_week, time, description, zwift_link, category).run();
    
    return new Response(JSON.stringify({ success: true, id: result.meta.lastRowId }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPATCH({ request, env, data }) {
  if (data.user?.role !== 'admin' && data.user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden: Admin or Moderator access required" }), { status: 403 });
  }

  try {
    const { id, name, day_of_week, time, description, zwift_link, category, is_active } = await request.json();
    await env.DB.prepare(
      "UPDATE inox_events SET name = ?, day_of_week = ?, time = ?, description = ?, zwift_link = ?, category = ?, is_active = ? WHERE id = ?"
    ).bind(name, day_of_week, time, description, zwift_link, category, is_active ? 1 : 0, id).run();
    
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestDELETE({ request, env, data }) {
  if (data.user?.role !== 'admin' && data.user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden: Admin or Moderator access required" }), { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id parameter" }), { status: 400 });
  }

  try {
    await env.DB.prepare("DELETE FROM inox_events WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
