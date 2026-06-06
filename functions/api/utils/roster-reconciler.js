export async function reconcileRoster(env, { teamId, wtrlRoster }) {
  if (!teamId) throw new Error("teamId required");

  // 1. BACKUP (Safe rebuild pattern)
  const backup = await env.ZRL_DB.prepare(
    "SELECT athlete_id FROM team_members WHERE team_id = ?"
  ).bind(teamId).all();

  // Filter valid riders
  const athletes = (wtrlRoster || []).map(r => ({
    zwid: parseInt(r.zwid || r.zid || r.profileId || r.zwiftId)
  })).filter(a => !isNaN(a.zwid));

  // Atomic batch operation
  const statements = [];
  
  // 2. DELETE OLD STATE
  statements.push(env.ZRL_DB.prepare(`
    DELETE FROM team_members WHERE team_id = ?
  `).bind(teamId));

  // 3. INSERT NEW STATE
  for (const a of athletes) {
    statements.push(env.ZRL_DB.prepare(`
      INSERT INTO team_members (team_id, athlete_id)
      VALUES (?, ?)
    `).bind(teamId, a.zwid));
  }

  // 4. UPDATE MEMBER COUNT
  statements.push(env.ZRL_DB.prepare(`
    UPDATE teams SET member_count = ? WHERE wtrl_team_id = ?
  `).bind(athletes.length, teamId));

  // Execute
  try {
    await env.ZRL_DB.batch(statements);
  } catch (err) {
    console.error(`[Reconciler ERROR] Failed for team ${teamId}:`, err);
    // Optional: Restore from backup if needed
    throw err;
  }

  return {
    teamId,
    count: athletes.length,
    status: "reconciled"
  };
}
