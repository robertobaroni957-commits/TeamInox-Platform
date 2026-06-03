export async function onRequestGet(context) {
  const { env, request, data } = context;
  const user = data?.user;
  const url = new URL(request.url);
  const team_id = url.searchParams.get("team_id");
  const round_id = url.searchParams.get("round_id");
  const season_id = url.searchParams.get("season_id"); // Now explicit

  if (!team_id) {
    return new Response(JSON.stringify({ error: "Missing team_id" }), { status: 400 });
  }

  try {
    // SECURITY: Rosters are viewable by any authenticated user in the club.
    // We only restrict write operations (POST).
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const targetTeam = await env.ZRL_DB.prepare("SELECT name, wtrl_team_id FROM teams WHERE wtrl_team_id = ?").bind(team_id).first();

    // WTRL SYNC (Only if explicit season_id provided)
    if (season_id && targetTeam?.wtrl_team_id) {
      const wtrlUrl = `https://www.wtrl.racing/api/zrl/${season_id}/teams/${targetTeam.wtrl_team_id}`;
      // ... (rest of the sync logic remains same)
      
      try {
        const wtrlRes = await fetch(wtrlUrl, { headers: { "accept": "application/json" } });
        if (wtrlRes.ok) {
          const wtrlData = await wtrlRes.json();
          const members = wtrlData.riders || wtrlData.members || [];

          if (members.length > 0) {
            const athleteStatements = [];
            const memberStatements = [];

            for (const rider of members) {
              const zwid = parseInt(rider.zwid || rider.profileId || rider.zwiftId);
              if (!zwid) continue;

              // Upsert Atleta con Avatar
              athleteStatements.push(env.ZRL_DB.prepare(`
                INSERT INTO athletes (zwid, name, base_category, avatar_url)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(zwid) DO UPDATE SET 
                  name = excluded.name,
                  avatar_url = excluded.avatar_url
              `).bind(zwid, rider.name, rider.category || 'N/A', rider.avatar || ''));

              // Upsert Relazione Team-Membro
              memberStatements.push(env.ZRL_DB.prepare(`
                INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                VALUES (?, ?)
              `).bind(team_id, zwid));
            }

            if (athleteStatements.length > 0) await env.ZRL_DB.batch(athleteStatements);
            if (memberStatements.length > 0) await env.ZRL_DB.batch(memberStatements);
          }
        }
      } catch (e) {
        console.error("WTRL Sync Error:", e.message);
      }
    }

    // 3. Recuperiamo i dati aggiornati dal DB locale
    // Usiamo DISTINCT sulla coppia athlete_id, team_id per evitare duplicati inaspettati
    let query = `
      SELECT DISTINCT a.zwid, a.name, a.base_category as category, a.role, a.avatar_url
      FROM athletes a
      JOIN team_members tm ON a.zwid = tm.athlete_id
      WHERE tm.team_id = ?
    `;
    let params = [team_id];

    if (round_id) {
      query += ` AND tm.athlete_id IN (SELECT athlete_id FROM availability WHERE round_id = ?) `;
      params.push(round_id);
    }

    query += ` ORDER BY a.name ASC `;

    const { results } = await env.ZRL_DB.prepare(query).bind(...params).all();

    const { results } = await env.ZRL_DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ 
      success: true, 
      roster: results 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Errore recupero roster:", err.message);
    return new Response(JSON.stringify({ error: err.message, roster: [] }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env, data } = context;
  const user = data?.user;

  if (!user || (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'captain')) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const { athlete_zwid, team_id } = await request.json();

    if (!athlete_zwid || !team_id) {
      return new Response(JSON.stringify({ error: "Missing athlete_zwid or team_id" }), { status: 400 });
    }

    if (user.role === 'captain') {
      const team = await env.ZRL_DB.prepare(`SELECT captain_id FROM teams WHERE wtrl_team_id = ?`).bind(team_id).first();
      if (!team || team.captain_id !== user.zwid) {
        return new Response(JSON.stringify({ error: "Forbidden: You can only manage your own teams" }), { status: 403 });
      }
    }

    // Verifichiamo il limite del roster (max 12)
    const count = await env.ZRL_DB.prepare(`SELECT COUNT(*) as total FROM team_members WHERE team_id = ?`).bind(team_id).first();
    if (count.total >= 12) {
      return new Response(JSON.stringify({ error: "Roster is full (max 12 riders)" }), { status: 400 });
    }

    // Aggiungiamo l'atleta al roster (Many-to-Many)
    await env.ZRL_DB.prepare(`
      INSERT OR IGNORE INTO team_members (team_id, athlete_id)
      VALUES (?, ?)
    `).bind(team_id, athlete_zwid).run();

    return new Response(JSON.stringify({ success: true, message: "Athlete assigned to roster" }));

  } catch (err) {
    console.error("Errore assegnazione roster:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

