export async function onRequestGet(context) {
  const { env, data } = context;
  const user = data?.user;

  // Solo Admin e Moderator possono vedere i suggerimenti globali
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    // 1. Recuperiamo tutti gli atleti con le loro preferenze (sia Favorite che Acceptable)
    // Usiamo preference_level >= 1 (quindi escludiamo solo le '⛔' o i non compilati)
    const { results } = await env.DB.prepare(`
      SELECT 
        a.zwid, 
        a.name, 
        a.base_category as category, 
        lt.display_name as preferred_time,
        lt.id as slot_id,
        utp.preference_level
      FROM athletes a
      JOIN user_time_preferences utp ON a.zwid = utp.zwid
      JOIN league_times lt ON utp.time_slot_id = lt.id
      WHERE utp.preference_level >= 1
      ORDER BY lt.slot_order, utp.preference_level DESC, a.base_category
    `).all();

    // 2. Raggruppiamo per Slot Orario e Categoria
    const suggestions = {};
    
    results.forEach(row => {
      const key = `${row.slot_id}_${row.category}`;
      if (!suggestions[key]) {
        suggestions[key] = {
          slot_id: row.slot_id,
          slot_name: row.preferred_time,
          category: row.category,
          count: 0,
          favorite_count: 0,
          acceptable_count: 0,
          athletes: []
        };
      }
      
      suggestions[key].count++;
      if (row.preference_level === 2) suggestions[key].favorite_count++;
      else suggestions[key].acceptable_count++;
      
      suggestions[key].athletes.push({ 
        zwid: row.zwid, 
        name: row.name,
        level: row.preference_level 
      });
    });

    // Trasformiamo in array e ordiniamo per numero di atleti (i gruppi più popolati per primi)
    const viableTeams = Object.values(suggestions)
      .sort((a, b) => b.count - a.count);

    return new Response(JSON.stringify({ 
      success: true, 
      viableTeams,
      total_expressed_preferences: results.length
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Errore suggerimenti roster:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
