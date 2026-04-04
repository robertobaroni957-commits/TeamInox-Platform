export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Selezioniamo i round filtrando i duplicati a livello di query
    // Prendiamo l'ID più alto per ogni nome di round nella stessa serie
    const { results } = await env.DB.prepare(`
      SELECT r.*, s.name as series_name 
      FROM rounds r
      LEFT JOIN series s ON r.series_id = s.id
      WHERE r.id IN (
        SELECT MAX(id) 
        FROM rounds 
        GROUP BY name, series_id
      )
      ORDER BY r.date ASC
    `).all();

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
