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

    // Funzione di utility per il mapping robusto
    const mapWtrlRound = (r, index, category) => {
      try {
        const raceName = (r.name || r.roundName || r.race || (r.event_id ? `Race ${r.event_id}` : `Race ${index + 1}`)).toString();
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

        const segments = Array.isArray(r.segments) ? r.segments : [];
        const strategyDetails = JSON.stringify({
            fal_segments: segments.map(s => `${s.segmentName || 'Unknown'} (x${s.segmentVisits || 1})`),
            fts_segments: segments.map(s => `${s.segmentName || 'Unknown'} (x${s.segmentVisits || 1})`),
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
      } catch (e) {
        console.error(`[IMPORT] Error mapping round ${index}:`, e.message);
        return null;
      }
    };

    // 1. Rilevamento tipo dato: JSON o HTML
    if (trimmedContent.startsWith('[') || trimmedContent.startsWith('{')) {
      try {
        const data = JSON.parse(trimmedContent);
        
        if (data.categories) {
            console.log("[IMPORT] Rilevato formato multi-categoria. Avvio aggregazione info percorsi.");
            const seenRounds = new Map();

            for (const [cat, payload] of Object.entries(data.categories)) {
                if (!Array.isArray(payload)) continue;

                const validRounds = payload.filter(r => {
                    const name = (r.name || r.roundName || r.race || "").toString();
                    return name && !name.match(/^\d+\.0$/);
                });
                
                validRounds.forEach((r, index) => {
                    const mapped = mapWtrlRound(r, index, cat);
                    if (!mapped) return;
                    
                    const raceName = mapped.name;
                    
                    if (!seenRounds.has(raceName)) {
                        // Inizializziamo il round principale con i dettagli della prima categoria incontrata
                        const strategy = JSON.parse(mapped.strategy_details);
                        strategy.category_details = {
                            [cat]: {
                                world: mapped.world,
                                route: mapped.route,
                                distance: mapped.distance,
                                elevation: mapped.elevation,
                                fal_segments: strategy.fal_segments,
                                fts_segments: strategy.fts_segments
                            }
                        };
                        mapped.strategy_details = JSON.stringify(strategy);
                        mapped.category = "ALL"; // Importante: deve essere ALL per permettere le disponibilità trasversali
                        seenRounds.set(raceName, mapped);
                    } else {
                        // Se abbiamo già visto la gara, aggiungiamo solo i dettagli del percorso per questa categoria
                        const existing = seenRounds.get(raceName);
                        const strategy = JSON.parse(existing.strategy_details);
                        if (!strategy.category_details) strategy.category_details = {};
                        
                        const newStrategyInfo = JSON.parse(mapped.strategy_details);
                        strategy.category_details[cat] = {
                            world: mapped.world,
                            route: mapped.route,
                            distance: mapped.distance,
                            elevation: mapped.elevation,
                            fal_segments: newStrategyInfo.fal_segments,
                            fts_segments: newStrategyInfo.fts_segments
                        };
                        existing.strategy_details = JSON.stringify(strategy);
                    }
                });
            }
            roundsData = Array.from(seenRounds.values());
        } else {
            const payload = data.payload || (Array.isArray(data) ? data : []);
            console.log(`[IMPORT] Analisi JSON standard: trovati ${payload.length} elementi.`);
            
            const filteredPayload = payload.filter(r => {
                const name = (r.name || r.roundName || r.race || "").toString();
                return name && !name.match(/^\d+\.0$/);
            });

            roundsData = filteredPayload.map((r, index) => mapWtrlRound(r, index, "ALL")).filter(r => r !== null);
        }
      } catch (e) {
        console.error("[IMPORT] Errore Parsing JSON:", e.message);
        return new Response(JSON.stringify({ error: `Errore nel parsing del JSON: ${e.message}` }), { status: 400 });
      }
    } else {
      // Fallback HTML (già esistente)
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
    }

    if (roundsData.length === 0) {
        return new Response(JSON.stringify({ error: "Nessuna gara valida trovata nel contenuto fornito." }), { status: 400 });
    }

    // 2. Aggiornamento DB
    const sId = parseInt(seasonId) || 19;
    const dates = roundsData.map(r => r.date).filter(d => d).sort();
    const startDate = dates.length > 0 ? dates[0] : null;
    const endDate = dates.length > 0 ? dates[dates.length - 1] : null;

    // Disattiviamo altre serie
    await env.DB.prepare("UPDATE series SET is_active = 0 WHERE external_season_id = ?").bind(sId).run();

    let seriesRecord = await env.DB.prepare("SELECT id FROM series WHERE external_season_id = ? ORDER BY id DESC").bind(sId).first();
    let activeSeriesId;
    
    if (seriesRecord) {
        activeSeriesId = seriesRecord.id;
        await env.DB.prepare("UPDATE series SET is_active = 1, name = ?, start_date = ?, end_date = ? WHERE id = ?")
            .bind(seasonName, startDate, endDate, activeSeriesId).run();
    } else {
        const res = await env.DB.prepare("INSERT INTO series (external_season_id, name, is_active, start_date, end_date) VALUES (?, ?, 1, ?, ?)")
            .bind(sId, seasonName, startDate, endDate).run();
        // Fallback per recuperare l'ID se meta non è disponibile come previsto
        const lastSeries = await env.DB.prepare("SELECT id FROM series ORDER BY id DESC LIMIT 1").first();
        activeSeriesId = lastSeries.id;
    }

    // --- AGGIORNAMENTO COMPATIBILITÀ ANALYTICS ---
    // 1. Assicuriamoci che esista una Season in zrl_seasons (Contenitore Globale)
    let zrlSeason = await env.DB.prepare("SELECT id FROM zrl_seasons WHERE is_active = 1 LIMIT 1").first();
    if (!zrlSeason) {
        // Se non c'è una season attiva, ne creiamo una di default per la stagione corrente
        await env.DB.prepare("INSERT INTO zrl_seasons (name, is_active) VALUES (?, 1)")
            .bind("ZRL Season 2025/26").run();
        zrlSeason = await env.DB.prepare("SELECT id FROM zrl_seasons ORDER BY id DESC LIMIT 1").first();
    }

    // 2. Assicuriamoci che esista un round_group collegato a questa season (necessario per Analytics)
    // Usiamo activeSeriesId (il nostro ID Round interno) per cercare se esiste già un mapping
    // NOTA: zrl_round_groups.series_id nel tuo schema punta a zrl_seasons.id
    let roundGroup = await env.DB.prepare("SELECT id FROM zrl_round_groups WHERE external_season_id = ?").bind(sId).first();

    if (!roundGroup) {
        await env.DB.prepare("INSERT INTO zrl_round_groups (series_id, round_index, external_season_id, description) VALUES (?, ?, ?, ?)")
            .bind(zrlSeason.id, 1, sId, seasonName).run();
    } else {
        await env.DB.prepare("UPDATE zrl_round_groups SET series_id = ?, description = ? WHERE external_season_id = ?")
            .bind(zrlSeason.id, seasonName, sId).run();
    }
    // ---------------------------------------------

    // 3. PULIZIA TOTALE
    const roundIdsResult = await env.DB.prepare("SELECT id FROM rounds WHERE series_id = ?").bind(activeSeriesId).all();
    const roundIds = (roundIdsResult.results || []).map(r => r.id);

    if (roundIds.length > 0) {
        const placeholders = roundIds.map(() => "?").join(",");
        const tablesToClean = ['race_lineup', 'round_teams', 'availability', 'results', 'division_results'];
        for (const table of tablesToClean) {
            try {
                await env.DB.prepare(`DELETE FROM ${table} WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
            } catch (e) {}
        }
    }

    await env.DB.prepare("DELETE FROM rounds WHERE series_id = ?").bind(activeSeriesId).run();

    // 4. Inserimento Gare
    let insertCount = 0;
    for (const r of roundsData) {
        try {
            await env.DB.prepare("INSERT INTO rounds (series_id, name, date, world, route, distance, elevation, powerups, format, strategy_details, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                .bind(activeSeriesId, r.name, r.date, r.world, r.route, r.distance, r.elevation, r.powerups, r.format, r.strategy_details, r.category).run();
            insertCount++;
        } catch (e) {
            console.error(`[IMPORT] Insert Error for ${r.name}:`, e.message);
        }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: insertCount,
      message: `Importazione completata: ${insertCount} gare inserite nel Round ${sId}.` 
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[IMPORT] Critical Error:", error.stack);
    return new Response(JSON.stringify({ error: `Errore Critico: ${error.message}` }), { status: 500 });
  }
}
