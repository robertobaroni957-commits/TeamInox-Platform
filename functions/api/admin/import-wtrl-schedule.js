// functions/api/admin/import-wtrl-schedule.js
export async function onRequestPost({ request, env }) {
  try {
    const { html, seasonId } = await request.json();
    let roundsData = [];
    let seasonName = `ZRL Round ${seasonId || '19'}`;

    if (!html) {
      return new Response(JSON.stringify({ error: "Content is missing" }), { status: 400 });
    }

    const trimmedContent = html.trim();

    // 1. Rilevamento tipo dato: JSON o HTML
    if (trimmedContent.startsWith('[') || trimmedContent.startsWith('{')) {
      // È JSON
      try {
        const data = JSON.parse(trimmedContent);
        // La API WTRL restituisce i dati in .payload o direttamente come array
        const payload = data.payload || (Array.isArray(data) ? data : []);

        console.log(`[IMPORT] Analisi JSON: trovati ${payload.length} elementi.`);

        roundsData = payload.map((r, index) => {
          // Mapping robusto basato sulla struttura reale di WTRL
          const raceName = r.race || r.name || r.roundName || `Race ${r.event_id || index + 1}`;
          const raceDate = r.eventDate || r.date || null;
          const world = r.courseWorld || r.world || "Unknown";
          const route = r.courseName || r.route || "See WTRL";
          
          // Nuovi campi richiesti
          const distance = parseFloat(r.courseDistance || r.distance || 0);
          const elevation = parseInt(r.courseElevation || r.elevation || 0);
          const powerups = r.powerUps || r.powerups || "Standard";

          console.log(`[IMPORT] Mapping Gara: ${raceName} | ${raceDate} | ${world} | ${route} | ${distance}km | ${elevation}m`);

          return {
            name: raceName,
            date: raceDate,
            world: world,
            route: route,
            distance: distance,
            elevation: elevation,
            powerups: powerups
          };
        });
      } catch (e) {
        console.error("[IMPORT] Errore Parsing JSON:", e.message);
        throw new Error("Errore nel parsing del JSON incollato.");
      }
    } else {
      // È HTML
      const roundMatches = html.match(/Round\s+(\d+):\s+([^<]+)/g) || [];
      const seasonNameMatch = html.match(/<div class="round-title[^>]*>([^<]+)<\/div>/);
      if (seasonNameMatch) seasonName = seasonNameMatch[1];

      const nextRaceMatch = html.match(/<strong>(\d{4}\/\d{2} Round \d+ - Race \d+)<\/strong><br>\s*<span>Date:<\/span>\s*([^<]+)<br>\s*<span>Format:<\/span>\s*([^<]+)/);
      if (nextRaceMatch) {
          roundsData.push({
              name: nextRaceMatch[1],
              date: nextRaceMatch[2],
              world: "See WTRL",
              route: "See WTRL",
              distance: 0,
              elevation: 0,
              powerups: "TBD"
          });
      }

      if (roundsData.length === 0) {
          for (let i = 1; i <= 6; i++) {
              roundsData.push({ name: `Race ${i}`, date: null, world: "TBD", route: "TBD", distance: 0, elevation: 0, powerups: "TBD" });
          }
      }
    }

    // 2. Aggiornamento DB (Upsert manuale per compatibilità)
    const sId = parseInt(seasonId) || 19;
    
    // Disattiviamo tutte le serie con questo ID esterno per evitare conflitti di "serie attiva"
    await env.DB.prepare("UPDATE series SET is_active = 0 WHERE external_season_id = ?").bind(sId).run();

    // Cerchiamo la serie più recente con questo ID esterno
    let series = await env.DB.prepare("SELECT id FROM series WHERE external_season_id = ? ORDER BY id DESC").bind(sId).first();
    
    if (series) {
        // Aggiorniamo quella esistente rendendola attiva
        await env.DB.prepare("UPDATE series SET is_active = 1, name = ? WHERE id = ?").bind(seasonName, series.id).run();
    } else {
        // Ne creiamo una nuova
        const res = await env.DB.prepare("INSERT INTO series (external_season_id, name, is_active) VALUES (?, ?, 1)")
            .bind(sId, seasonName).run();
        series = { id: res.meta.lastRowId };
    }

    // 3. PULIZIA TOTALE (Per evitare il mix di dati vecchi/nuovi)
    // Rimuoviamo tutte le gare precedentemente associate a questa serie
    await env.DB.prepare("DELETE FROM rounds WHERE series_id = ?").bind(series.id).run();

    // 4. Aggiornamento Gare
    for (const r of roundsData) {
        await env.DB.prepare("INSERT INTO rounds (series_id, name, date, world, route, distance, elevation, powerups) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(series.id, r.name, r.date, r.world, r.route, r.distance, r.elevation, r.powerups).run();
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: roundsData.length,
      seriesId: series.id,
      message: `Pulizia effettuata. Importate ${roundsData.length} nuove gare per il Round ${seasonId}.` 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
