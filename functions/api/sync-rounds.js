export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    let seasonId = "19"; 
    
    // Cerchiamo la serie attiva nel DB
    const activeSeries = await env.DB.prepare("SELECT external_season_id FROM series WHERE is_active = 1").first();
    if (activeSeries?.external_season_id) {
      seasonId = activeSeries.external_season_id.toString();
    }

    // Override da body
    try {
      const body = await request.json();
      if (body.seasonId) seasonId = body.seasonId.toString();
    } catch (e) {}

    const action = "schedule";
    
    const fetchSchedule = async (cat) => {
        const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&category=${cat}&action=${action}`;
        
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Referer": "https://www.wtrl.racing/zwift-racing-league/schedule/"
            }
        });

        const contentType = res.headers.get("content-type") || "";
        const text = await res.text();

        if (!res.ok) {
            throw new Error(`WTRL API error ${res.status}: ${text.substring(0, 100)}`);
        }

        if (contentType.includes("text/html") || text.trim().startsWith("<")) {
            throw new Error("WTRL ha restituito HTML invece di JSON. L'IP del server potrebbe essere temporaneamente bloccato o l'endpoint è cambiato.");
        }

        try {
            const data = JSON.parse(text);
            return data.payload || (Array.isArray(data) ? data : []);
        } catch (e) {
            throw new Error(`Errore parsing JSON WTRL: ${e.message}`);
        }
    };

    const [scheduleA, scheduleC] = await Promise.all([
        fetchSchedule("A"),
        fetchSchedule("C")
    ]);

    const combinedRounds = [...scheduleA, ...scheduleC];
    const uniqueRounds = [];
    const seenNames = new Set();

    combinedRounds.forEach(r => {
        if (!r) return;
        const rName = r.race || r.name || r.roundName || `Round ${r.event_id}`;
        const rDate = r.eventDate || r.date || "";
        const rWorld = r.courseWorld || r.world || "";
        const rRoute = r.courseName || r.route || "";

        if (rName && !seenNames.has(rName)) {
            seenNames.add(rName);
            uniqueRounds.push({ name: rName, date: rDate, world: rWorld, route: rRoute });
        }
    });

    if (uniqueRounds.length === 0) {
        throw new Error(`Nessun round trovato per la stagione ${seasonId} su WTRL.`);
    }

    // 1. Gestione Serie (Upsert manuale per compatibilità)
    let series = await env.DB.prepare("SELECT id FROM series WHERE external_season_id = ?").bind(parseInt(seasonId)).first();
    
    if (series) {
        await env.DB.prepare("UPDATE series SET is_active = 1 WHERE id = ?").bind(series.id).run();
    } else {
        const res = await env.DB.prepare("INSERT INTO series (external_season_id, name, is_active) VALUES (?, ?, 1)")
            .bind(parseInt(seasonId), `ZRL Season ${seasonId}`).run();
        series = { id: res.meta.lastRowId };
    }

    // 2. Aggiornamento Round
    for (const r of uniqueRounds) {
        const existingRound = await env.DB.prepare("SELECT id FROM rounds WHERE series_id = ? AND name = ?")
            .bind(series.id, r.name).first();
        
        if (existingRound) {
            await env.DB.prepare("UPDATE rounds SET date = ?, world = ?, route = ? WHERE id = ?")
                .bind(r.date, r.world, r.route, existingRound.id).run();
        } else {
            await env.DB.prepare("INSERT INTO rounds (series_id, name, date, world, route) VALUES (?, ?, ?, ?, ?)")
                .bind(series.id, r.name, r.date, r.world, r.route).run();
        }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: uniqueRounds.length,
      message: `Sincronizzati ${uniqueRounds.length} round dalla stagione ${seasonId} di WTRL.` 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
