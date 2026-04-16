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
      const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=${wtrlId}&season=${SEASON_ID}&action=teamlist`;
      console.log(`[WTRL] Fetching: ${url}`);

      try {
        const res = await fetch(url, {
          headers: {
            "accept": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          }
        });

        const text = await res.text();
        if (!res.ok) {
          console.error(`[WTRL ERROR] ${res.status}: ${text.substring(0, 100)}`);
          return [];
        }

        try {
          const data = JSON.parse(text);
          return data.payload || [];
        } catch (e) {
          console.error(`[JSON ERROR] Errore nel parse della risposta per ${wtrlId}`);
          return [];
        }
      } catch (err) {
        console.error(`[FETCH ERROR] ${wtrlId}:`, err.message);
        return [];
      }
    };

    const teamsLists = await Promise.all(wtrlIds.map(fetchTeams));
    const allTeams = teamsLists.flat();

    const report = { 
      teams_synced: 0, 
      athletes_synced: 0, 
      details: [], 
      total_received: allTeams.length 
    };

    if (allTeams.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: `Attenzione: WTRL ha restituito 0 squadre totali per la stagione ${SEASON_ID}. Verificare la connessione o i parametri.`,
        report
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Elaborazione team
    for (const t of allTeams) {
      const teamName = (t.teamname || t.name || '').toUpperCase();
      const clubId = (t.clubId || t.club_id || '').toLowerCase();
      const TARGET_CLUB_ID = INOX_CLUB_ID.toLowerCase();
      
      // Log per i primi 10 team o se il nome contiene INOX per debug
      if (teamName.includes('INOX')) {
        console.log(`[DEBUG] Controllo Team: "${teamName}", ClubID: "${clubId}", Target: "${TARGET_CLUB_ID}"`);
      }

      // Filtro rigoroso INOX (reso case-insensitive per il clubId)
      if (clubId !== TARGET_CLUB_ID && (!teamName.includes('INOX') || teamName.includes('EQUINOX'))) continue;

      console.log(`[MATCH] Trovato team INOX: ${teamName} (ID: ${t.id || t.wtrl_team_id})`);

      const wtrlTeamId = parseInt(t.id || t.wtrl_team_id);
      if (isNaN(wtrlTeamId)) continue;

      const teamResult = await env.DB.prepare(`
        INSERT INTO teams (
          name, category, division, division_number, wtrl_team_id, club_id, 
          tttid, club_name, gender, league, zrldivision, league_color, 
          rec, status, is_dev, rounds, member_count
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(wtrl_team_id) DO UPDATE SET
          name = excluded.name,
          category = excluded.category,
          division = excluded.division,
          division_number = excluded.division_number,
          club_id = excluded.club_id,
          tttid = excluded.tttid,
          club_name = excluded.club_name,
          gender = excluded.gender,
          league = excluded.league,
          zrldivision = excluded.zrldivision,
          league_color = excluded.league_color,
          rec = excluded.rec,
          status = excluded.status,
          is_dev = excluded.is_dev,
          rounds = excluded.rounds,
          member_count = excluded.member_count
        RETURNING id
      `)
      .bind(
        t.teamname || t.name,
        t.division || '',
        t.zrldivision || '',
        parseInt(t.divnum) || 0,
        wtrlTeamId,
        clubId || INOX_CLUB_ID,
        parseInt(t.tttid) || null,
        t.clubName || '',
        t.gender || '',
        t.league || '',
        t.zrldivision || '',
        t.leagueColor || '',
        parseInt(t.rec) || 0,
        parseInt(t.status) || 0,
        parseInt(t.isdev) || 0,
        t.rounds || '',
        parseInt(t.members) || 0
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
          // Gestione flessibile struttura WTRL (riders o members)
          members = rosterData.riders || rosterData.members || [];
        }
      } catch (rosterErr) {
        console.error(`[WTRL ERROR] Roster fetch error for ${wtrlTeamId}:`, rosterErr.message);
      }

      const statements = [];
      
      // PULIZIA ROSTER ATTUALE (Per rendere WTRL l'unica fonte di verità)
      statements.push(env.DB.prepare(`DELETE FROM team_members WHERE team_id = ?`).bind(internalTeamId));

      for (const m of members) {
        const zwid = parseInt(m.profileId || m.zwiftId || m.zwid);
        if (!zwid) continue;

        // 1. Upsert Atleta con dati estesi
        statements.push(env.DB.prepare(`
          INSERT INTO athletes (
            zwid, name, role, base_category, avatar_url, 
            zftp, zftpw, zmap, zmapw, profile_id, wtrl_user_id
          )
          VALUES (?, ?, 'athlete', ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(zwid) DO UPDATE SET 
            name = excluded.name,
            base_category = excluded.base_category,
            avatar_url = excluded.avatar_url,
            zftp = excluded.zftp,
            zftpw = excluded.zftpw,
            zmap = excluded.zmap,
            zmapw = excluded.zmapw,
            profile_id = excluded.profile_id,
            wtrl_user_id = excluded.wtrl_user_id
        `).bind(
          zwid, 
          m.name, 
          m.category || '', 
          m.avatar || '',
          parseFloat(m.zftp) || 0,
          parseInt(m.zftpw) || 0,
          parseFloat(m.zmap) || 0,
          parseInt(m.zmapw) || 0,
          parseInt(m.profileId) || null,
          m.userId || ''
        ));

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
