export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const season_code = url.searchParams.get("season_code");

  if (!env.ZRL_DB) return new Response("DB non trovato", { status: 500 });

  try {
    const pathParts = url.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // 1. Lookup specifico per singolo Round
    if (lastPart !== 'rounds' && lastPart !== '') {
      const identifier = lastPart;
      const isNumeric = /^\d+$/.test(identifier);
      
      let round;
      if (isNumeric && parseInt(identifier) > 100000) {
        round = await env.ZRL_DB.prepare("SELECT * FROM rounds_v2 WHERE wtrl_id = ?").bind(parseInt(identifier)).first();
      } else if (isNumeric) {
        round = await env.ZRL_DB.prepare("SELECT * FROM rounds_v2 WHERE id = ?").bind(parseInt(identifier)).first();
      }
      
      if (!round) return new Response(JSON.stringify({ error: "Round non trovato" }), { status: 404 });
      
      // Arricchimento per singolo round
      const races = await env.ZRL_DB.prepare(`
          SELECT r.id, r.name, r.date as scheduled_at, r.world, r.route
          FROM zrl_races r
          JOIN zrl_round_groups g ON r.zrl_round_group_id = g.id
          WHERE g.external_season_id = ?
      `).bind(round.wtrl_id).all();
      
      return new Response(JSON.stringify({ ...round, races: races.results || [] }), { headers: { "Content-Type": "application/json" } });
    }

    // 2. Lookup lista Round (SSOT V3)
    let query = "SELECT * FROM rounds_v2";
    let params = [];

    if (season_code) {
      query += " WHERE season_code = ?";
      params.push(season_code);
    }
    
    query += " ORDER BY starts_at ASC, round_number ASC";

    const { results: rounds } = await env.ZRL_DB.prepare(query).bind(...params).all();

    // 3. ENRICHMENT: Leggiamo le gare da zrl_races (V2/V3) invece che da rounds (V1)
    const enrichedRounds = await Promise.all((rounds || []).map(async (r) => {
      if (!r.wtrl_id) return { ...r, races: [] };
      
      // Cerchiamo le gare collegate al WTRL ID del round
      const races = await env.ZRL_DB.prepare(`
          SELECT r.id, r.name, r.date as scheduled_at, r.world, r.route
          FROM zrl_races r
          JOIN zrl_round_groups g ON r.zrl_round_group_id = g.id
          WHERE g.external_season_id = ?
      `).bind(r.wtrl_id).all();

      return { ...r, races: races.results || [] };
    }));

    return new Response(JSON.stringify(enrichedRounds), { 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      } 
    });
  } catch (error) {
    console.error("[API Rounds Error]", error);
    return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
    });
  }
}
