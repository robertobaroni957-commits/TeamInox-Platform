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
      if (clubId !== INOX_CLUB_ID && !teamName.includes('INOX')) continue;

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
      report.teams_synced++;

      // Assicuriamoci che members sia un array
      let members = [];
      if (Array.isArray(t.members)) {
        members = t.members;
      } else if (t.members && typeof t.members === 'object') {
        members = Object.values(t.members);
      } else {
        console.log(`[INFO] Team senza membri array: ${teamName}, dati raw:`, JSON.stringify(t).substring(0,200));
      }

      const athleteStatements = members
        .filter(m => m.zwiftId || m.zwid)
        .map(m => env.DB.prepare(`
          INSERT OR REPLACE INTO athletes (zwid, name, team_id, role)
          VALUES (?, ?, ?, 'athlete')
        `).bind(parseInt(m.zwiftId || m.zwid), m.name, internalTeamId));

      if (athleteStatements.length > 0) {
        await env.DB.batch(athleteStatements);
        report.athletes_synced += athleteStatements.length;
      }

      report.details.push({ team: teamName, wtrl_id: t.id, roster_count: members.length });
    }

    console.log(`✅ Totale squadre Inox trovate: ${report.teams_synced}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Sincronizzazione completata: ${report.teams_synced} squadre trovate, ${report.athletes_synced} atleti aggiornati.`,
      report
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('ERRORE Sync All Teams:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}