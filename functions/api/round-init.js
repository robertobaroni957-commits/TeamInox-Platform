export async function onRequestPost(context) {
  const { env, request, data } = context;

  const user = data?.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const body = await request.json();

    const {
      wtrl_id,
      name,
      starts_at,
      season_code
    } = body;

    if (!wtrl_id || !name || !season_code) {
      return new Response(JSON.stringify({
        error: "Missing required fields"
      }), { status: 400 });
    }

    // 🔥 SINGLE SOURCE OF TRUTH (V3 ONLY)
    const query = `
      INSERT INTO rounds_v2 (
        wtrl_id,
        name,
        starts_at,
        season_code
      )
      VALUES (?, ?, ?, ?)
      ON CONFLICT(wtrl_id)
      DO UPDATE SET
        name = excluded.name,
        starts_at = excluded.starts_at,
        season_code = excluded.season_code
    `;

    await env.ZRL_DB
      .prepare(query)
      .bind(
        wtrl_id,
        name,
        starts_at || null,
        season_code
      )
      .run();

    return new Response(JSON.stringify({
      success: true,
      message: "Round saved in V3 (rounds_v2)",
      wtrl_id
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });

  } catch (err) {
    console.error("[ROUND INIT ERROR]", err);

    return new Response(JSON.stringify({
      error: "Failed to initialize round",
      detail: err?.message
    }), { status: 500 });
  }
}