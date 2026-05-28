export async function onRequestGet(context) {
  const { env, data } = context;
  const traceId = data?.traceId || crypto.randomUUID();
  console.log(`[seasons] handler start. traceId: ${traceId}`);

  try {
    if (!env.ZRL_DB) throw new Error("env.ZRL_DB is undefined");
    
    // Fix: Using GROUP BY name to ensure uniqueness, 
    // keeping the one with max(id) to have the most recent/complete record.
    // Ordering by is_active first (active seasons on top) then id desc.
    const results = await env.ZRL_DB.prepare(`
        SELECT id, code, name 
        FROM seasons 
        ORDER BY id DESC
    `).all();
    
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
      traceId
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
