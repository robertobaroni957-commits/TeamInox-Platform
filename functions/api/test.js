export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // 1. Crea la tabella round_teams se non esiste
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS round_teams (
          round_id INTEGER REFERENCES rounds(id),
          team_id INTEGER REFERENCES teams(id),
          timeslot_id TEXT REFERENCES league_times(id),
          PRIMARY KEY (round_id, team_id)
      )
    `).run();

    // 2. Verifica se ci sono team
    const teams = await env.DB.prepare("SELECT COUNT(*) as count FROM teams").first();

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Database riparato: tabella round_teams creata o già esistente.",
      teams_found: teams.count
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
