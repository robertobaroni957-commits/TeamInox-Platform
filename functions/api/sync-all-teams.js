export async function onRequestPost(context) {
  const { env } = context;
  
  try {
    const seasonId = "19"; 
    const action = "teamlist";
    const testParam = btoa(action); 
    const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
    const bearerToken = btoa(env.WTRL_SID);

    // Funzione helper per scaricare da una lega specifica
    const fetchFromWtrl = async (wtrlId) => {
        const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=${wtrlId}&season=${seasonId}&action=${action}&test=${testParam}`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Authorization": `Bearer ${bearerToken}`,
                "Wtrl-Integrity": env.WTRL_INTEGRITY,
                "Cookie": `wtrl_sid=${env.WTRL_SID}; wtrl_ouid=${env.WTRL_OUID}`,
                "X-Requested-With": "XMLHttpRequest"
            }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.payload || [];
    };

    console.log("Inizio scansione ZRL (Open) e WZRL (Women)...");

    // Eseguiamo le due chiamate in parallelo
    const [openTeams, womenTeams] = await Promise.all([
        fetchFromWtrl("zrl"),
        fetchFromWtrl("wzrl")
    ]);

    const allTeams = [...openTeams, ...womenTeams];

    // Filtriamo per Club ID o per Nome (evitando falsi positivi come Equinox)
    const inoxTeams = allTeams.filter(t => {
        const teamName = (t.teamname || "").toUpperCase();
        const hasCorrectId = t.clubId === INOX_CLUB_ID;
        
        // Controllo preciso: "INOX" come parola a sé stante, non parte di altre parole (es. EQUINOX)
        const hasInoxName = /\bINOX\b/.test(teamName);
        
        // Escludiamo esplicitamente Equinox per sicurezza se non ha il Club ID corretto
        const isEquinox = teamName.includes("EQUINOX");
        
        return (hasCorrectId || hasInoxName) && !isEquinox;
    });

    console.log(`DEBUG: Trovate ${inoxTeams.length} squadre totali (Open: ${openTeams.length}, Women: ${womenTeams.length}).`);

    if (inoxTeams.length > 0) {
        // 1. Inserimento/Aggiornamento delle squadre trovate
        const statements = inoxTeams.map(t => {
            return env.DB.prepare(`
                INSERT INTO teams (name, category, division, wtrl_team_id, club_id)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(wtrl_team_id) DO UPDATE SET 
                    name = excluded.name,
                    category = excluded.category,
                    division = excluded.division,
                    club_id = excluded.club_id
            `).bind(t.teamname, t.division, t.zrldivision, t.id, t.clubId);
        });
        await env.DB.batch(statements);

        // 2. Pulizia: Rimuoviamo dal database le squadre che hanno un WTRL ID 
        // ma non sono più nella nostra lista filtrata (es: Equinox rimosso dal filtro)
        const inoxWtrlIds = inoxTeams.map(t => t.id);
        if (inoxWtrlIds.length > 0) {
            const placeholders = inoxWtrlIds.map(() => "?").join(",");
            await env.DB.prepare(`
                DELETE FROM teams 
                WHERE wtrl_team_id IS NOT NULL 
                AND wtrl_team_id NOT IN (${placeholders})
            `).bind(...inoxWtrlIds).run();
        }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: inoxTeams.length,
      message: `Database aggiornato con ${inoxTeams.length} squadre (ZRL + WZRL).` 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
