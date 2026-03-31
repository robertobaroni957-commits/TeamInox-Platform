export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Recuperiamo tutte le squadre salvate nel DB D1
    // Usiamo una query semplice che non richiede join con athletes per ora
    const { results } = await env.DB.prepare(`
      SELECT * FROM teams 
      ORDER BY category ASC, division ASC, name ASC
    `).all();

    return new Response(JSON.stringify({ 
        success: true, 
        teams: results 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Errore recupero teams locali:", err.message);
    return new Response(JSON.stringify({ error: err.message, teams: [] }), { status: 500 });
  }
}
