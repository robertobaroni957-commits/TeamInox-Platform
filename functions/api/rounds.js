export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const seriesId = url.searchParams.get("series_id");

  try {
    let query = `
      SELECT r.*, s.name as series_name 
      FROM rounds r
      LEFT JOIN series s ON r.series_id = s.id
    `;
    
    let params = [];

    if (seriesId) {
      query += ` WHERE r.series_id = ? `;
      params.push(seriesId);
    } else {
      // Se non specificato, restituiamo solo i round della serie ATTIVA
      query += ` WHERE s.is_active = 1 `;
    }

    query += ` ORDER BY r.date ASC `;

    const { results } = await env.DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ 
        success: true, 
        rounds: results 
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate" 
      }
    });

  } catch (err) {
    console.error("ERRORE API rounds:", err.message);
    return new Response(JSON.stringify({ error: err.message, rounds: [] }), { status: 500 });
  }
}
