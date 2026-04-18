export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const INOX_CLUB_ID = 'cef70cde-9149-43a2-b3ae-187643a44703';
    const SEASON_ID = "19";
    const WTRL_COOKIE = env.WTRL_COOKIE || "";

    if (!WTRL_COOKIE) {
      throw new Error("WTRL_COOKIE non trovato nelle variabili d'ambiente.");
    }

    const results = {
      series_synced: false,
      rounds_synced: 0,
      teams_synced: 0,
      athletes_synced: 0,
      availability_set: 0,
      errors: []
    };

    // 1. Inizializzazione Stagione e 8 Round (Logica Script)
    await env.DB.prepare(`
      INSERT OR IGNORE INTO series (id, name, external_season_id, is_active) 
      VALUES (1, 'ZRL Season 19', 19, 1)
    `).run();
    results.series_synced = true;

    const roundStatements = [];
    for (let i = 1; i <= 8; i++) {
      roundStatements.push(
        env.DB.prepare(`INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (?, 1, ?)`)
          .bind(i, `Round ${i}`)
      );
    }
    await env.DB.batch(roundStatements);
    results.rounds_synced = 8;

    // 2. Fetch Liste Team (zrl, wzrl)
    const wtrlIds = ["zrl", "wzrl"];
    let allTeams = [];

    for (const wtrlId of wtrlIds) {
      const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=${wtrlId}&season=${SEASON_ID}&action=teamlist&test=dGVhbWxpc3Q%3D`;
      try {
        const res = await fetch(url, {
          headers: { "cookie": WTRL_COOKIE, "user-agent": "Mozilla/5.0" }
        });
        const data = await res.json();
        if (data.payload) allTeams = allTeams.concat(data.payload);
      } catch (e) {
        results.errors.push(`Errore fetch ${wtrlId}: ${e.message}`);
      }
    }

    // 3. Filtro Team INOX
    const filteredTeams = allTeams.filter(t => {
      const teamName = (t.teamname || t.name || '').toUpperCase();
      const clubId = (t.clubId || t.club_id || '').toLowerCase();
      return (clubId === INOX_CLUB_ID.toLowerCase() || (teamName.includes('INOX') && !teamName.includes('EQUINOX')));
    });

    // 4. Sincronizzazione Team e Roster
    for (const t of filteredTeams) {
      const wtrlTeamId = t.id || t.wtrl_team_id;
      const teamName = t.teamname || t.name;

      await env.DB.prepare(`
        INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(wtrl_team_id) DO UPDATE SET 
          name=excluded.name, 
          category=excluded.category, 
          division=excluded.division, 
          member_count=excluded.member_count
      `).bind(
        teamName, 
        t.division || '', 
        t.zrldivision || '', 
        parseInt(t.divnum) || 0, 
        wtrlTeamId, 
        INOX_CLUB_ID, 
        parseInt(t.members) || 0
      ).run();

      results.teams_synced++;

      // Fetch Roster
      try {
        const rosterRes = await fetch(`https://www.wtrl.racing/api/zrl/${SEASON_ID}/teams/${wtrlTeamId}`, { 
          headers: { "cookie": WTRL_COOKIE } 
        });
        const rosterData = await rosterRes.json();
        const members = rosterData.riders || rosterData.members || [];

        if (members.length > 0) {
          // Pulizia roster per questo team
          await env.DB.prepare(`
            DELETE FROM team_members 
            WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = ?)
          `).bind(wtrlTeamId).run();

          const athleteStatements = [];
          for (const m of members) {
            const zwid = m.zwid || m.profileId || m.zwiftId;
            if (!zwid) continue;

            // Fix Avatar
            let avatar = m.avatar || m.avatar_url || '';
            if (avatar && !avatar.startsWith('http')) {
              if (avatar.includes('/')) avatar = `https://www.wtrl.racing${avatar}`;
              else avatar = `https://www.wtrl.racing/uploads/profile_picture/${avatar}`;
            }

            // Upsert Atleta
            athleteStatements.push(
              env.DB.prepare(`
                INSERT INTO athletes (zwid, name, base_category, avatar_url)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(zwid) DO UPDATE SET 
                  name=excluded.name, 
                  avatar_url=excluded.avatar_url, 
                  base_category=excluded.base_category
              `).bind(zwid, m.name, m.category || '', avatar)
            );

            // Link Team
            athleteStatements.push(
              env.DB.prepare(`
                INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                VALUES ((SELECT id FROM teams WHERE wtrl_team_id = ?), ?)
              `).bind(wtrlTeamId, zwid)
            );

            // Disponibilità Default
            for (let r = 1; r <= 8; r++) {
              athleteStatements.push(
                env.DB.prepare(`INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (?, ?, 'available')`)
                  .bind(zwid, r)
              );
              results.availability_set++;
            }
            results.athletes_synced++;
          }
          
          if (athleteStatements.length > 0) {
            await env.DB.batch(athleteStatements);
          }
        }
      } catch (e) {
        results.errors.push(`Errore roster per ${teamName}: ${e.message}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Sincronizzazione Totale Inox completata con successo.",
      results 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
