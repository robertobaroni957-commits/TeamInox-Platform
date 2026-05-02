// functions/api/admin/system-insights.js
export async function onRequestGet({ env, data }) {
  const user = data?.user;
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    // 1. Atleti senza categoria
    const noCategory = await env.DB.prepare(
      "SELECT count(*) as count FROM athletes WHERE base_category IS NULL OR base_category = ''"
    ).first();

    // 2. Atleti senza email (che non possono loggarsi)
    const noEmail = await env.DB.prepare(
      "SELECT count(*) as count FROM athletes WHERE email IS NULL OR email = ''"
    ).first();

    // 3. Atleti senza password (importati che devono ancora registrarsi)
    const noPassword = await env.DB.prepare(
      "SELECT count(*) as count FROM athletes WHERE password_hash IS NULL"
    ).first();

    // 4. Riepilogo preferenze espresse (per capire se il roster è pronto)
    const rsvpSummary = await env.DB.prepare(`
      SELECT count(DISTINCT zwid) as count FROM user_time_preferences WHERE preference_level >= 1
    `).first();

    // 5. Squadre senza capitano assegnato
    const teamsNoCaptain = await env.DB.prepare(`
      SELECT count(*) as count FROM teams t 
      WHERE t.id NOT IN (SELECT team_id FROM team_members tm JOIN athletes a ON tm.athlete_id = a.zwid WHERE a.role = 'captain')
    `).first();

    return new Response(JSON.stringify({
      success: true,
      insights: {
        missingCategory: noCategory.count,
        missingEmail: noEmail.count,
        pendingRegistration: noPassword.count,
        activeRoster: rsvpSummary.count,
        teamsNeedingCaptain: teamsNoCaptain.count
      }
    }), { 
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
