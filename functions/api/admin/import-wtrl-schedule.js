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
                const mappedRounds = payload.map((r, index) => mapWtrlRound(r, index, cat));
                roundsData.push(...mappedRounds);
            }
        } else {
            const payload = data.payload || (Array.isArray(data) ? data : []);
            console.log(`[IMPORT] Analisi JSON: trovati ${payload.length} elementi.`);
            roundsData = payload.map((r, index) => mapWtrlRound(r, index, "ALL"));
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
        const res = await env.DB.prepare("INSERT INTO series (external_season_id, name, is_active) VALUES (?, ?, 1)")
            .bind(sId, seasonName).run();
        series = { id: res.meta.lastRowId };
    }

    // 3. PULIZIA TOTALE
    const roundIdsResult = await env.DB.prepare("SELECT id FROM rounds WHERE series_id = ?").bind(series.id).all();
    const roundIds = roundIdsResult.results.map(r => r.id);

    if (roundIds.length > 0) {
        const placeholders = roundIds.map(() => "?").join(",");
        await env.DB.prepare(`DELETE FROM race_lineup WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
        await env.DB.prepare(`DELETE FROM round_teams WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
        await env.DB.prepare(`DELETE FROM availability WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
        await env.DB.prepare(`DELETE FROM results WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
        try {
            await env.DB.prepare(`DELETE FROM division_results WHERE round_id IN (${placeholders})`).bind(...roundIds).run();
        } catch (e) {}
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
