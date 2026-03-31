export async function onRequestPost(context) {
  const { env } = context;
  
  try {
    const seasonId = "19"; 
    const action = "schedule";
    const testParam = btoa(action); 
    const bearerToken = btoa(env.WTRL_SID);

    const fetchSchedule = async (cat) => {
        const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&category=${cat}&action=${action}&test=${testParam}`;
        
        console.log(`DEBUG SYNC ROUNDS: Fetching schedule for category ${cat} from ${url}`);
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Authorization": `Bearer ${bearerToken}`,
                "Wtrl-Integrity": env.WTRL_INTEGRITY,
                "Cookie": `wtrl_sid=${env.WTRL_SID}; wtrl_ouid=${env.WTRL_OUID}`,
                "X-Requested-With": "XMLHttpRequest",
                "wtrl-api-version": "2.7"
            }
        });

        if (!res.ok) {
            const errorBody = await res.text(); 
            console.error(`WTRL Risposta Errore Categoria ${cat}: Status ${res.status}`);
            console.error(`WTRL Errore Body (${cat}): ${errorBody.substring(0, 200)}`);
            return [];
        }

        const data = await res.json();
        
        console.log(`DEBUG SYNC ROUNDS: WTRL response for category ${cat}. Status: ${res.status}. Data (first 300 chars): ${JSON.stringify(data).substring(0, 300)}`);
        
        let extractedData = data;
        if (Array.isArray(data)) { extractedData = data; } 
        else if (data && typeof data === 'object') {
            const possibleKeys = ['payload', 'wtrl', 'schedule', 'data', 'results', 'rounds', 'events'];
            for (const key of possibleKeys) {
                if (Array.isArray(data[key])) { extractedData = data[key]; break; }
            }
            if (extractedData.length === 0 && Object.keys(data).length > 0) {
                const values = Object.values(data);
                if (values.length > 0 && Array.isArray(values[0])) { extractedData = values[0]; } 
                else if (values.length > 0 && typeof values[0] === 'object' && values[0].race) { extractedData = values.filter(v => v && v.race); }
            }
        }
        
        if (!Array.isArray(extractedData) || extractedData.length === 0) {
            console.warn(`WARN: Nessun round trovato per ${cat}. Struttura dati WTRL (primi 200 chars): ${JSON.stringify(data).substring(0, 200)}`);
            return [];
        } else {
            console.log(`DEBUG: Trovati ${extractedData.length} round per ${cat}.`);
        }

        return extractedData;
    };

    console.log(`Sincronizzazione Schedule Stagione ${seasonId} per categorie A e C...`);
    const [scheduleA, scheduleC] = await Promise.all([
        fetchSchedule("A"),
        fetchSchedule("C")
    ]);

    const combinedRounds = [...scheduleA, ...scheduleC];
    const uniqueRounds = [];
    const seenNames = new Set();

    combinedRounds.forEach(r => {
        if (!r) return;
        const rName = r.name || r.roundName || r.round || r.event_name || r.roundname || r.race;
        const rDate = r.eventDate || r.date || r.roundDate || r.event_date || r.rounddate || "";
        const rWorld = r.world || r.map || r.map_name || r.worldname || r.courseWorld || "";
        const rRoute = r.route || r.routeName || r.route_name || r.routename || r.courseName || "";
        const rCategory = r.subgroup_label || r.category || "Unknown"; 

        if (rName && !seenNames.has(rName)) {
            seenNames.add(rName);
            uniqueRounds.push({ name: rName, date: rDate, world: rWorld, route: rRoute, category: rCategory });
        }
    });

    if (uniqueRounds.length === 0) {
        // Se non troviamo nulla, lanciamo un errore più informativo
        throw new Error(`Nessun round valido trovato per le categorie A e C. Dati WTRL ricevuti (primi 200 chars): ${JSON.stringify(combinedRounds).substring(0, 200)}`);
    }

    // --- MIGRAZIONE SCHEMA DATABASE ---
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS seasons (id INTEGER PRIMARY KEY, name TEXT, is_active INTEGER DEFAULT 0)`).run();
    
    await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            season_id INTEGER, 
            name TEXT, 
            date TEXT, 
            world TEXT, 
            route TEXT,
            category TEXT
        )
    `).run();

    try {
        await env.DB.prepare("ALTER TABLE rounds ADD COLUMN category TEXT").run();
        console.log("INFO: Colonna 'category' aggiunta alla tabella 'rounds'.");
    } catch (e) {
        if (e.message.includes("duplicate column")) {
            console.log("INFO: Colonna 'category' già presente nella tabella 'rounds'.");
        } else {
            console.error("ERRORE durante ALTER TABLE rounds:", e.message);
        }
    }
    // --- FINE MIGRAZIONE SCHEMA ---

    await env.DB.prepare("INSERT OR REPLACE INTO seasons (id, name, is_active) VALUES (?, ?, ?)")
                .bind(parseInt(seasonId), `ZRL Season ${seasonId}`, 1).run();
    
    await env.DB.prepare("DELETE FROM rounds WHERE season_id = ?").bind(parseInt(seasonId)).run();
    
    const statements = uniqueRounds.map(r => {
        return env.DB.prepare(`INSERT INTO rounds (season_id, name, date, world, route, category) VALUES (?, ?, ?, ?, ?, ?)`)
                    .bind(parseInt(seasonId), r.name, r.date, r.world, r.route, r.category);
    });

    if (statements.length > 0) {
        await env.DB.batch(statements);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: uniqueRounds.length,
      message: `Sincronizzati ${uniqueRounds.length} round.` 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("ERRORE CRITICO SYNC ROUNDS:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
