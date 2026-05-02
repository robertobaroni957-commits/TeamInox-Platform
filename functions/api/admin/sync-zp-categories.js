// functions/api/admin/sync-zp-categories.js
export async function onRequestPost({ request, env }) {
  try {
    const { riders } = await request.json();

    if (!riders || !Array.isArray(riders)) {
      return new Response(JSON.stringify({ error: "Dati non validi. Fornire un array di atleti." }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const queries = [];
    let updateCount = 0;

    for (const r of riders) {
      const zwid = parseInt(r.zwift_id || r.zwid || r.profileId || r.userId);
      const category = (r.category || r.base_category || '').trim().toUpperCase();

      if (!zwid || !category) continue;

      let cleanCat = category;
      if (category === 'A+') cleanCat = 'APLUS';

      queries.push(
        env.DB.prepare("UPDATE athletes SET base_category = ? WHERE zwid = ?")
          .bind(cleanCat, zwid)
      );
      updateCount++;
    }

    if (queries.length > 0) {
      await env.DB.batch(queries);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sincronizzazione completata! ${updateCount} categorie aggiornate.`,
      count: updateCount 
    }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Sync ZP Categories Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
