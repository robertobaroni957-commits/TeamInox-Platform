export async function onRequestPost({ env }) {
  try {
    const INOX_CLUB_ID = 'cef70cde-9149-43a2-b3ae-187643a44703';
    const SEASON_ID = "19";
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

    for (const t of allTeams) {
      const teamName = (t.teamname || t.name || '').toUpperCase();
      const clubId = t.clubId || t.club_id || '';
      
      if (clubId !== INOX_CLUB_ID && (!teamName.includes('INOX') || teamName.includes('EQUINOX'))) continue;

      const teamResult = await env.DB.prepare(`
        INSERT OR REPLACE INTO teams (name, category, division, wtrl_team_id, club_id)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        t.teamname || t.name,
        t.division || '',
        t.zrldivision || '',
        parseInt(t.id || t.wtrl_team_id),
        clubId || INOX_CLUB_ID
      )
      .first();

      if (!teamResult || teamResult.id === undefined) continue;
      const internalTeamId = teamResult.id;
      const wtrlTeamId = parseInt(t.id || t.wtrl_team_id);
      report.teams_synced++;

      // RECUPERO ROSTER
      console.log(`[WTRL] Fetching roster for team ${wtrlTeamId} (${teamName})...`);
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
          members = rosterData.members || [];
        }
      } catch (rosterErr) {
        console.error(`[WTRL ERROR] Roster fetch error:`, rosterErr.message);
      }

      const statements = [];
      for (const m of members) {
        const zwid = parseInt(m.zwiftId || m.zwid);
        if (!zwid) continue;

        // 1. Inseriamo/Aggiorniamo l'atleta
        statements.push(env.DB.prepare(`
          INSERT OR REPLACE INTO athletes (zwid, name, role)
          VALUES (?, ?, 'athlete')
        `).bind(zwid, m.name));

        // 2. Associamo l'atleta al team nel roster (Many-to-Many)
        statements.push(env.DB.prepare(`
          INSERT OR IGNORE INTO team_members (team_id, athlete_id)
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
      message: `Sincronizzazione completata: ${report.teams_synced} squadre e roster aggiornati.`,
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
