export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const season_code = url.searchParams.get("season_code");
  const series_id = url.searchParams.get("series_id"); // Legacy

  if (!env.ZRL_DB) return new Response("DB non trovato", { status: 500 });

  try {
    // Determine if we're looking for a specific round via path parameter
    // Cloudflare Pages Functions doesn't give us path params directly in onRequest unless we use a [id].js file
    // But we can check the URL path
    const pathParts = url.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    if (lastPart !== 'rounds' && lastPart !== '') {
      // Specific round lookup
      const identifier = lastPart;
      const isNumeric = /^\d+$/.test(identifier);
      
      let round;
      if (isNumeric && parseInt(identifier) > 100000) {
        // Assume WTRL ID
        round = await env.ZRL_DB.prepare("SELECT * FROM rounds_v2 WHERE wtrl_id = ?").bind(parseInt(identifier)).first();
      } else if (isNumeric) {
        // Assume internal ID
        round = await env.ZRL_DB.prepare("SELECT * FROM rounds_v2 WHERE id = ?").bind(parseInt(identifier)).first();
      }
      
      if (!round) return new Response(JSON.stringify({ error: "Round non trovato" }), { status: 404 });
      return new Response(JSON.stringify(round), { headers: { "Content-Type": "application/json" } });
    }

    // List lookup
    let query = "SELECT * FROM rounds_v2";
    let params = [];

    if (season_code) {
      query += " WHERE season_code = ?";
      params.push(season_code);
    } else if (series_id) {
      // Legacy support: map series_id to rounds_v2 if possible, or use old table
      // For safety during migration, we use rounds_v2 if it exists, otherwise fallback
      query = "SELECT * FROM rounds_v2 WHERE season_code = (SELECT code FROM seasons WHERE id = ?)";
      params.push(series_id);
    }
    
    query += " ORDER BY starts_at ASC, round_number ASC";

    const results = await env.ZRL_DB.prepare(query).bind(...params).all();
    const rounds = results.results || [];

    // ENRICHMENT: Fetch races for each round using the bridge logic
    const enrichedRounds = await Promise.all(rounds.map(async (r) => {
      if (!r.wtrl_id) return { ...r, races: [] };
      
      const series = await env.ZRL_DB.prepare("SELECT id FROM series WHERE external_season_id = ?").bind(r.wtrl_id).first();
      if (!series) return { ...r, races: [] };

      const races = await env.ZRL_DB.prepare("SELECT * FROM rounds WHERE series_id = ?").bind(series.id).all();
      return { ...r, races: races.results || [] };
    }));

    return new Response(JSON.stringify(enrichedRounds), { 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      } 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

