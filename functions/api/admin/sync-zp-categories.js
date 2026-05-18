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
    let processedCount = 0;

    const divMapping = {
      5: 'A+',
      10: 'A',
      20: 'B',
      30: 'C',
      40: 'D'
    };

    for (const r of riders) {
      const zwid = parseInt(r.zwift_id || r.zwid || r.profileId || r.userId);
      if (!zwid) continue;

      // Determinazione Categoria
      let category = (r.category || r.base_category || '').trim().toUpperCase();
      
      // Se non c'è category, proviamo con div (mappatura ZwiftPower)
      if (!category && r.div !== undefined) {
        category = divMapping[parseInt(r.div)] || '';
      }

      // Normalizzazione A+
      // Se vogliamo mantenere la distinzione A+, non facciamo nulla.
      // Se in futuro servirà raggrupparli, lo faremo a livello di UI.

      // Sesso (ZwiftPower: 1=M, 2=F)
      let gender = parseInt(r.gender) === 2 ? 'F' : 'M';
      
      // Nome
      const name = (r.name || r.username || `Rider ${zwid}`).trim();

      // Utilizziamo INSERT INTO ... ON CONFLICT per creare o aggiornare
      queries.push(
        env.ZRL_DB.prepare(`
          INSERT INTO athletes (zwid, name, base_category, gender, role) 
          VALUES (?, ?, ?, ?, 'athlete')
          ON CONFLICT(zwid) DO UPDATE SET 
            name = CASE 
              WHEN athletes.name IS NULL OR athletes.name = '' OR athletes.name LIKE 'Rider %' 
              THEN EXCLUDED.name 
              ELSE athletes.name 
            END,
            base_category = COALESCE(NULLIF(EXCLUDED.base_category, ''), athletes.base_category),
            gender = COALESCE(EXCLUDED.gender, athletes.gender)
        `).bind(zwid, name, category, gender)
      );
      
      processedCount++;
    }

    if (queries.length > 0) {
      // D1 batch ha un limite di 100 query alla volta per sicurezza, ma wrangler gestisce bene anche di più
      // Per sicurezza facciamo dei chunk se l'array è molto grande (> 50)
      const chunkSize = 50;
      for (let i = 0; i < queries.length; i += chunkSize) {
        await env.ZRL_DB.batch(queries.slice(i, i + chunkSize));
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sincronizzazione completata! ${processedCount} atleti elaborati (creati o aggiornati).`,
      count: processedCount 
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

