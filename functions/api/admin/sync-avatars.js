// functions/api/admin/sync-avatars.js
export async function onRequestPost({ request, env, data }) {
  const user = data?.user;

  // Protezione: solo admin o moderator
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    // 1. Recuperiamo tutti gli atleti che NON hanno un'avatar_url valida
    const { results: athletes } = await env.ZRL_DB.prepare(`
      SELECT zwid, name FROM athletes 
      WHERE avatar_url IS NULL OR avatar_url = '' OR avatar_url = 'null'
    `).all();

    if (!athletes || athletes.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Tutti gli atleti hanno già un avatar o non ci sono atleti nel DB.",
        count: 0 
      }));
    }

    const updates = [];
    let processedCount = 0;

    for (const athlete of athletes) {
      // Pattern ufficiale Zwift per gli avatar pubblici
      // Nota: Non tutte le immagini sono accessibili così, ma è il fallback più affidabile senza API key Strava/Zwift
      const zwiftAvatarUrl = `https://static-cdn.zwift.com/prod/profile/${athlete.zwid}`;
      
      // Prepariamo l'update. 
      // Usiamo una tecnica di "probabilità": impostiamo l'URL di Zwift.
      // Se l'immagine non esiste, il browser mostrerà il fallback (iniziali) che abbiamo già nel frontend.
      updates.push(
        env.ZRL_DB.prepare("UPDATE athletes SET avatar_url = ? WHERE zwid = ?")
          .bind(zwiftAvatarUrl, athlete.zwid)
      );
      processedCount++;
    }

    // Eseguiamo in batch per efficienza
    if (updates.length > 0) {
      // D1 ha un limite di 100 statements per batch, dividiamo se necessario
      const chunks = [];
      for (let i = 0; i < updates.length; i += 100) {
        chunks.push(updates.slice(i, i + 100));
      }

      for (const chunk of chunks) {
        await env.ZRL_DB.batch(chunk);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sincronizzazione completata! Associate ${processedCount} potenziali immagini profilo.`,
      count: processedCount 
    }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Sync Avatars Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

