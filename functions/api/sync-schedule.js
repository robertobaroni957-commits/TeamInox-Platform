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
        name: `Round ${item.race || '?'}`,
        date: item.eventDate || "",
        world: item.courseWorld || "TBD",
        route: item.courseName || "TBD"
      };

      if (!r.date) continue;

      // Update o Insert manuale per evitare conflitti di Foreign Key
      const existing = await env.DB.prepare("SELECT id FROM rounds WHERE series_id = ? AND name = ?")
        .bind(series_id, r.name).first();
        
      if (existing) {
        await env.DB.prepare("UPDATE rounds SET date = ?, world = ?, route = ? WHERE id = ?")
          .bind(r.date, r.world, r.route, existing.id).run();
        results.push({ ...r, status: 'updated' });
      } else {
        await env.DB.prepare("INSERT INTO rounds (series_id, name, date, world, route) VALUES (?, ?, ?, ?, ?)")
          .bind(series_id, r.name, r.date, r.world, r.route).run();
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
