// functions/api/strava-auth.js
export async function onRequestPost({ request, env, data }) {
  const user = data?.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { code } = await request.json();
    
    const client_id = env.STRAVA_CLIENT_ID;
    const client_secret = env.STRAVA_CLIENT_SECRET;

    if (!client_id || !client_secret) {
      return new Response(JSON.stringify({ error: "Strava configuration missing on server" }), { status: 500 });
    }

    // Scambio codice con token
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
        grant_type: "authorization_code"
      })
    });

    const stravaData = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: stravaData.message || "Strava API error" }), { status: res.status });
    }

    // Salva i token nel DB
    await env.DB.prepare(`
      INSERT INTO strava_tokens (athlete_id, access_token, refresh_token, expires_at, scope)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(athlete_id) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        expires_at = excluded.expires_at,
        scope = excluded.scope
    `).bind(
      user.zwid, 
      stravaData.access_token, 
      stravaData.refresh_token, 
      stravaData.expires_at, 
      "read,activity:read_all"
    ).run();

    return new Response(JSON.stringify({ success: true }));

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
