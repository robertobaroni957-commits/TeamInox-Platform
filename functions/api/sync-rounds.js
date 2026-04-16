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
    const testParam = btoa(action); 
    const WTRL_COOKIE = env.WTRL_COOKIE || "";

    const fetchSchedule = async (cat) => {
        const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&category=${cat}&action=${action}&test=${testParam}`;
        
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json",
                "Cookie": WTRL_COOKIE
            }
        });

        if (!res.ok) return [];

        const data = await res.json();
        return data.payload || (Array.isArray(data) ? data : []);
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

    // Upsert Serie
    await env.DB.prepare("INSERT INTO series (external_season_id, name, is_active) VALUES (?, ?, 1) ON CONFLICT(external_season_id) DO UPDATE SET is_active = 1")
                .bind(parseInt(seasonId), `ZRL Season ${seasonId}`).run();
    
    // Prendiamo l'ID interno della serie
    const series = await env.DB.prepare("SELECT id FROM series WHERE external_season_id = ?").bind(parseInt(seasonId)).first();

    // Aggiorniamo i round
    const statements = uniqueRounds.map(r => {
        return env.DB.prepare(`
            INSERT INTO rounds (series_id, name, date, world, route) 
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(series_id, name) DO UPDATE SET
                date = excluded.date,
                world = excluded.world,
                route = excluded.route
        `).bind(series.id, r.name, r.date, r.world, r.route);
    });

    if (statements.length > 0) {
        await env.DB.batch(statements);
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
