// functions/api/roster.js

export async function onRequestGet(context) {
  const { env, request, data } = context;

  const user = data?.user;
  const url = new URL(request.url);

  const team_id = url.searchParams.get("team_id");
  const round_id = url.searchParams.get("round_id"); // opzionale (solo enrichment RSVP)

  if (!team_id) {
    return new Response(JSON.stringify({ error: "Missing team_id" }), {
      status: 400,
    });
  }

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const query = `
      SELECT
        a.zwid,
        a.name,
        a.base_category AS category,
        a.role,
        a.avatar_url,
        tm.team_id,
        tm.season_id,
        tm.is_active,
        (
          SELECT status
          FROM availability av
          WHERE av.zwid = a.zwid
          AND av.round_id = ?
          LIMIT 1
        ) AS rsvp_status
      FROM team_members tm
      JOIN athletes a ON a.zwid = tm.athlete_id
      WHERE tm.team_id = ?
        AND tm.is_active = 1
      ORDER BY a.name ASC
    `;

    const { results } = await env.ZRL_DB
      .prepare(query)
      .bind(round_id || 0, team_id)
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        team_id,
        count: results?.length || 0,
        roster: results || [],
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Roster fetch failed",
        detail: err?.message,
      }),
      { status: 500 }
    );
  }
}