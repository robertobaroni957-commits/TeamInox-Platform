export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { seasonId, teamId } = await request.json();

    if (!seasonId || !teamId) {
      return new Response(JSON.stringify({ error: "Dati mancanti (seasonId o teamId)" }), { status: 400 });
    }

    // Costruiamo l'URL WTRL
    const wtrlUrl = `https://www.wtrl.racing/api/zrl/${seasonId}/teams/${teamId}`;

    // Recuperiamo il cookie di sessione dalle variabili d'ambiente (definite in .dev.vars)
    // NOTA: Senza questo, WTRL risponderà 401
    const wtrlCookie = env.WTRL_COOKIE || "";

    console.log(`Richiesta a WTRL per Team ${teamId}, Stagione ${seasonId}...`);

    const response = await fetch(wtrlUrl, {
      headers: {
        "accept": "application/json",
        "cookie": wtrlCookie,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ 
        error: `Errore WTRL: ${response.status}`, 
        detail: errorText 
      }), { status: response.status });
    }

    const data = await response.json();

    // --- LOGICA DATABASE D1 ---
    // Inseriamo o aggiorniamo gli atleti nel DB locale
    // Assumiamo che 'data.members' sia l'array dei componenti (da verificare con il JSON reale)
    const members = data.members || []; 
    
    for (const member of members) {
      // Usiamo l'ID Zwift come chiave
      // Supponiamo che WTRL dia: member.zwiftId e member.name
      if (member.zwiftId) {
        await env.DB.prepare(`
          INSERT INTO athletes (zwid, name, team)
          VALUES (?, ?, ?)
          ON CONFLICT(zwid) DO UPDATE SET name = excluded.name, team = excluded.team
        `).bind(member.zwiftId, member.name, data.teamName || "INOX").run();
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sincronizzati ${members.length} atleti per il team ${data.teamName || teamId}`,
      data: data 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
