export async function onRequestGet(context) {
  const { env, data } = context;
  const traceId = data?.traceId || crypto.randomUUID();
  console.log(`[seasons] handler start. traceId: ${traceId}`);
  console.log("[seasons] env exists:", !!env);
  console.log("[seasons] env.ZRL_DB exists:", !!env.ZRL_DB);
  console.log("[seasons] context data:", data);

  try {
    if (!env.ZRL_DB) throw new Error("env.ZRL_DB is undefined");
    
    const results = await env.ZRL_DB.prepare(
        "SELECT id, name, external_season_id, is_active FROM zrl_seasons ORDER BY id DESC"
    ).all();
    
    return new Response(JSON.stringify({
        success: true,
        data: results.results || [],
        traceId
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error(`[seasons] Critical failure:`, err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message,
      stack: err.stack,
      traceId
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
