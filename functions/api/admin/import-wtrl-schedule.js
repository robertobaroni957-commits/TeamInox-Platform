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

    // Funzione di utility per il mapping
    const mapWtrlRound = (r, index, category) => {
      const raceName = r.name || r.roundName || (r.race ? `Race ${r.race}` : `Race ${index + 1}`);
      const raceDate = r.eventDate || r.date || null;
      const world = r.courseWorld || r.world || "Unknown";
      const route = r.courseName || r.route || "See WTRL";
      
      const distance = r.lapDistanceInMeters ? 
        parseFloat(((r.lapDistanceInMeters * (r.duration || 1) + (r.leadinDistanceInMeters || 0)) / 1000).toFixed(1)) : 
        parseFloat(r.courseDistance || r.distance || 0);
      
      const elevation = r.lapAscentInMeters ? 
        Math.round(r.lapAscentInMeters * (r.duration || 1) + (r.leadinAscentInMeters || 0)) : 
        parseInt(r.courseElevation || r.elevation || 0);

      const format = r.raceFormat || "Scratch";
      
      let powerups = r.powerUps || r.powerups || "Standard";
      if (r.tags && Array.isArray(r.tags)) {
          const puTag = r.tags.find(t => t.includes('powerup') || t.includes('pu'));
          if (puTag) powerups = puTag;
      }

      const strategyDetails = JSON.stringify({
          fal_segments: r.segments ? r.segments.map(s => `${s.segmentName} (x${s.segmentVisits})`) : [],
          fts_segments: r.segments ? r.segments.map(s => `${s.segmentName} (x${s.segmentVisits})`) : [],
          powerup_details: powerups
      });

      return {
        name: raceName,
        date: raceDate,
        world: world,
        route: route,
        distance: distance,
        elevation: elevation,
        powerups: powerups,
        format: format,
        strategy_details: strategyDetails,
        category: category
      };
    };

    // 1. Rilevamento tipo dato: JSON o HTML
    if (trimmedContent.startsWith('[') || trimmedContent.startsWith('{')) {
      try {
        const data = JSON.parse(trimmedContent);
        
        if (data.categories) {
            console.log("[IMPORT] Rilevato formato multi-categoria.");
            for (const [cat, payload] of Object.entries(data.categories)) {
                // Filtriamo i placeholder inutili come "1.0", "2.0" che a volte WTRL manda
                const validRounds = (payload || []).filter(r => {
                    const name = (r.name || r.roundName || r.race || "").toString();
                    return name && !name.match(/^\d+\.0$/);
                });
                
                const mappedRounds = validRounds.map((r, index) => mapWtrlRound(r, index, cat));
                roundsData.push(...mappedRounds);
            }
        } else {
            const payload = data.payload || (Array.isArray(data) ? data : []);
            console.log(`[IMPORT] Analisi JSON: trovati ${payload.length} elementi.`);
            
            // Filtro anche per il formato standard
            const filteredPayload = payload.filter(r => {
                const name = (r.name || r.roundName || r.race || "").toString();
                return name && !name.match(/^\d+\.0$/);
            });

            roundsData = filteredPayload.map((r, index) => mapWtrlRound(r, index, "ALL"));
        }
      } catch (e) {
        console.error("[IMPORT] Errore Parsing JSON:", e.message);
        throw new Error("Errore nel parsing del JSON incollato.");
      }
    } else {
      // È HTML
      const nextRaceMatch = html.match(/<strong>(\d{4}\/\d{2} Round \d+ - Race \d+)<\/strong><br>\s*<span>Date:<\/span>\s*([^<]+)<br>\s*<span>Format:<\/span>\s*([^<]+)/);
      if (nextRaceMatch) {
          roundsData.push({
              name: nextRaceMatch[1],
              date: nextRaceMatch[2],
              world: "See WTRL",
              route: "See WTRL",
              distance: 0,
              elevation: 0,
              powerups: "TBD",
              format: "Race",
              strategy_details: "{}",
              category: "ALL"
          });
      }

      if (roundsData.length === 0) {
          for (let i = 1; i <= 6; i++) {
              roundsData.push({ name: `Race ${i}`, date: null, world: "TBD", route: "TBD", distance: 0, elevation: 0, powerups: "TBD", format: "Scratch", strategy_details: "{}", category: "ALL" });
          }
      }
    }

    // 2. Aggiornamento DB
    const sId = parseInt(seasonId) || 19;
    await env.DB.prepare("UPDATE series SET is_active = 0 WHERE external_season_id = ?").bind(sId).run();

    let series = await env.DB.prepare("SELECT id FROM series WHERE external_season_id = ? ORDER BY id DESC").bind(sId).first();
    
    if (series) {
        await env.DB.prepare("UPDATE series SET is_active = 1, name = ? WHERE id = ?").bind(seasonName, series.id).run();
    } else {
        await env.DB.prepare("INSERT INTO series (external_season_id, name, is_active) VALUES (?, ?, 1)")
            .bind(sId, seasonName).run();
        series = await env.DB.prepare("SELECT id FROM series WHERE external_season_id = ?").bind(sId).first();
    }

    // --- AGGIORNAMENTO COMPATIBILITÀ ANALYTICS ---
    // Assicuriamoci che esista un round_group per questa serie (necessario per Analytics e Standings)
    // E che sia collegato alla serie CORRETTA (ID attivo)
    const activeSeriesId = series.id; // Otteniamo l'ID della serie attiva
    
    // Qui dobbiamo assicurarci che zrl_round_groups venga popolato con la series_id CORRETTA.
    // Il problema era che zrl_round_groups.id=1 puntava a series_id=1, non alla serie attiva 57.
    // Dobbiamo creare/aggiornare un entry in zrl_round_groups che corrisponda alla serie ATTIVA.
    // Potrebbe essere necessario associare più round_group_id se il frontend li gestisce come distinti,
    // ma per ora, assumiamo che esista una mappatura primaria corretta per la stagione attiva.

    // Cerchiamo se esiste già un round group collegato alla serie ATTIVA
    let roundGroup = await env.DB.prepare("SELECT id FROM zrl_round_groups WHERE series_id = ?").bind(activeSeriesId).first();

    if (!roundGroup) {
        // Se non esiste, creane uno nuovo per la serie attiva.
        // Potremmo aver bisogno di un modo più intelligente per impostare round_index e description
        // ma per ora, assicuriamoci che esista il collegamento alla serie ATTIVA.
        await env.DB.prepare("INSERT INTO zrl_round_groups (series_id, round_index, external_season_id, description) VALUES (?, ?, ?, ?)")
            .bind(activeSeriesId, 1, sId, seasonName).run(); // round_index=1 è un placeholder, potrebbe necessitare miglioramento
    } else {
        // Se esiste, aggiorniamolo per assicurarci che sia legato alla serie attiva corretta
        await env.DB.prepare("UPDATE zrl_round_groups SET external_season_id = ?, description = ? WHERE series_id = ?")
            .bind(sId, seasonName, activeSeriesId).run();
    }
    // ---------------------------------------------

    // 3. PULIZIA TOTALE (Surgical Clean)
    const roundIdsResult = await env.DB.prepare("SELECT id FROM rounds WHERE series_id = ?").bind(series.id).all();
    const roundIds = (roundIdsResult.results || []).map(r => r.id);

    if (roundIds.length > 0) {
        const placeholders = roundIds.map(() => "?").join(",");
        try {
            await env.DB.prepare(`DELETE FROM race_lineup WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
            await env.DB.prepare(`DELETE FROM round_teams WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
            await env.DB.prepare(`DELETE FROM availability WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
            await env.DB.prepare(`DELETE FROM results WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
            // division_results potrebbe non esistere ancora nel database remoto o locale
            try {
                await env.DB.prepare(`DELETE FROM division_results WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
            } catch (e) {
                console.log("Tabella division_results non presente, salto pulizia.");
            }
        } catch (cleanErr) {
            console.error("Errore durante la pulizia dei round esistenti:", cleanErr.message);
        }
    }

    await env.DB.prepare("DELETE FROM rounds WHERE series_id = ?").bind(series.id).run();

    // 4. Aggiornamento Gare
    for (const r of roundsData) {
        await env.DB.prepare("INSERT INTO rounds (series_id, name, date, world, route, distance, elevation, powerups, format, strategy_details, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(series.id, r.name, r.date, r.world, r.route, r.distance, r.elevation, r.powerups, r.format, r.strategy_details, r.category).run();
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: roundsData.length,
      seriesId: series.id,
      message: `Pulizia effettuata. Importate ${roundsData.length} nuove gare (con distinzione categorie) per il Round ${seasonId}.` 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
