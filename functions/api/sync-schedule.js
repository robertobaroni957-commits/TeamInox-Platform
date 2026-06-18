export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    const url = "https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=19&category=A&action=schedule&test=c2NoZWR1bGU%3D";
    
    console.log(`[SYNC] Avvio richiesta a WTRL: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `WTRL ha risposto con status ${res.status}` }), { status: 500 });
    }

    const data = await res.json();
    
    // Estrazione payload
    const rawRounds = (data && data.payload) ? data.payload : (Array.isArray(data) ? data : []);

    if (rawRounds.length === 0) {
      return new Response(JSON.stringify({ error: "Nessun dato trovato nel JSON di WTRL", raw: data }), { status: 500 });
    }

    const series_id = 1;
    const results = [];

    for (const item of rawRounds) {
      const r = {
        wtrl_id: parseInt(item.wtrlid) || 0,
        round_number: parseInt(item.race) || 0,
        name: `Round ${item.race || '?'}`,
        starts_at: item.eventDate || "",
        season_code: 'zrl_25_26'
      };

      if (!r.starts_at || !r.wtrl_id) continue;

      // Update o Insert manuale su rounds
      const existing = await env.ZRL_DB.prepare("SELECT id FROM rounds WHERE wtrl_id = ?")
        .bind(r.wtrl_id).first();
        
      if (existing) {
        await env.ZRL_DB.prepare("UPDATE rounds SET starts_at = ?, round_number = ?, name = ? WHERE id = ?")
          .bind(r.starts_at, r.round_number, r.name, existing.id).run();
        results.push({ ...r, status: 'updated' });
      } else {
        await env.ZRL_DB.prepare("INSERT INTO rounds (wtrl_id, round_number, name, starts_at, season_code) VALUES (?, ?, ?, ?, ?)")
          .bind(r.wtrl_id, r.round_number, r.name, r.starts_at, r.season_code).run();
        results.push({ ...r, status: 'inserted' });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: results.length,
      message: "Sincronizzazione completata con successo",
      data: results
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

