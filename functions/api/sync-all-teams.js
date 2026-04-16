export async function onRequestPost({ request, env }) {
  try {
    const INOX_CLUB_ID = 'cef70cde-9149-43a2-b3ae-187643a44703';
    let SEASON_ID = "19";

    // Cerchiamo la serie attiva nel DB per usare il suo external_season_id come default
    const activeSeries = await env.DB.prepare("SELECT external_season_id FROM series WHERE is_active = 1").first();
    if (activeSeries?.external_season_id) {
      SEASON_ID = activeSeries.external_season_id.toString();
    }
    
    // Tentiamo di sovrascrivere con seasonId dal body se presente
    try {
      const body = await request.json();
      if (body.seasonId) SEASON_ID = body.seasonId.toString();
    } catch (e) {
      // Se fallisce (body vuoto o non JSON), cerchiamo nella query per flessibilità
      const url = new URL(request.url);
      const s = url.searchParams.get("seasonId");
      if (s) SEASON_ID = s;
    }

    const WTRL_COOKIE = env.WTRL_COOKIE || "";

    const wtrlIds = ["zrl", "wzrl"];

    const fetchTeams = async (wtrlId) => {
      const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=${wtrlId}&season=${SEASON_ID}&action=teamlist&test=dGVhbWxpc3Q%3D`;
      console.log(`[WTRL] Fetching teamlist-${wtrlId}: ${url}`);

      try {
        const res = await fetch(url, {
          headers: {
            "accept": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "cookie": WTRL_COOKIE
          }
        });

        if (!res.ok) {
          const txt = await res.text();
          console.error(`[WTRL ERROR] teamlist-${wtrlId} → ${res.status}: ${txt.substring(0, 200)}`);
          return [];
        }

        const data = await res.json();
        return data.payload || [];
      } catch (err) {
        console.error(`[WTRL ERROR] Fetch failed for ${wtrlId}:`, err.message);
        return [];
      }
    };

    const teamsLists = await Promise.all(wtrlIds.map(fetchTeams));
    const allTeams = teamsLists.flat();

    const report = { teams_synced: 0, athletes_synced: 0, details: [] };

    // Elaborazione team in parallelo limitato o sequenziale con ottimizzazione roster
    for (const t of allTeams) {
      const teamName = (t.teamname || t.name || '').toUpperCase();
      const clubId = t.clubId || t.club_id || '';
      
      // Filtro rigoroso INOX
      if (clubId !== INOX_CLUB_ID && (!teamName.includes('INOX') || teamName.includes('EQUINOX'))) continue;

      const wtrlTeamId = parseInt(t.id || t.wtrl_team_id);
      if (isNaN(wtrlTeamId)) continue;

      const teamResult = await env.DB.prepare(`
        INSERT INTO teams (name, category, division, wtrl_team_id, club_id)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(wtrl_team_id) DO UPDATE SET
          name = excluded.name,
          category = excluded.category,
          division = excluded.division,
          club_id = excluded.club_id
        RETURNING id
      `)
      .bind(
        t.teamname || t.name,
        t.division || '',
        t.zrldivision || '',
        wtrlTeamId,
        clubId || INOX_CLUB_ID
      )
      .first();

      if (!teamResult || teamResult.id === undefined) continue;
      const internalTeamId = teamResult.id;
      report.teams_synced++;

      // RECUPERO ROSTER DA WTRL (Obbligatorio)
      console.log(`[WTRL] Syncing roster for team ${wtrlTeamId} (${teamName})...`);
      let members = [];
      try {
        const rosterUrl = `https://www.wtrl.racing/api/zrl/${SEASON_ID}/teams/${wtrlTeamId}`;
        const rosterRes = await fetch(rosterUrl, {
          headers: {
            "accept": "application/json",
            "cookie": WTRL_COOKIE,
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          }
        });
        
        if (rosterRes.ok) {
          const rosterData = await rosterRes.json();
          // Gestione flessibile struttura WTRL (members o riders)
          members = rosterData.members || rosterData.riders || [];
        }
      } catch (rosterErr) {
        console.error(`[WTRL ERROR] Roster fetch error for ${wtrlTeamId}:`, rosterErr.message);
      }

      const statements = [];
      
      // PULIZIA ROSTER ATTUALE (Per rendere WTRL l'unica fonte di verità)
      statements.push(env.DB.prepare(`DELETE FROM team_members WHERE team_id = ?`).bind(internalTeamId));

      for (const m of members) {
        const zwid = parseInt(m.zwiftId || m.zwid);
        if (!zwid) continue;

        // 1. Upsert Atleta (senza cambiare ruolo)
        statements.push(env.DB.prepare(`
          INSERT INTO athletes (zwid, name, role)
          VALUES (?, ?, 'athlete')
          ON CONFLICT(zwid) DO UPDATE SET name = excluded.name
        `).bind(zwid, m.name));

        // 2. Inserimento nel Roster
        statements.push(env.DB.prepare(`
          INSERT INTO team_members (team_id, athlete_id)
          VALUES (?, ?)
        `).bind(internalTeamId, zwid));
      }

      if (statements.length > 0) {
        await env.DB.batch(statements);
        report.athletes_synced += members.length;
      }

      report.details.push({ team: teamName, wtrl_id: wtrlTeamId, roster_count: members.length });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Sincronizzazione completata: ${report.teams_synced} squadre e roster aggiornati per la stagione ${SEASON_ID}.`,
      report
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('ERRORE Sync All Teams:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
