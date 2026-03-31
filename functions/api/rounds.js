export async function onRequestGET(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(`
      SELECT r.*, s.name as series_name 
      FROM rounds r
      LEFT JOIN series s ON r.series_id = s.id
      ORDER BY r.date ASC
    `).all();

    // Log di debug per vedere cosa ritorna la query
    console.log("DEBUG API rounds: Query D1 completata. Trovati", results.length, "round.");
    // Logga la struttura dati (limitata a 300 caratteri)
    console.log("DEBUG API rounds: Dati ricevuti dal DB:", JSON.stringify(results).substring(0, 300));

    return new Response(JSON.stringify({ 
        success: true, 
        rounds: results 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("ERRORE API rounds:", err.message);
    return new Response(JSON.stringify({ error: err.message, rounds: [] }), { status: 500 });
  }
}
