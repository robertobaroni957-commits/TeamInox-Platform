// functions/api/winter-tour/rankings.js

export async function onRequestGet({ request, env }) {
  try {
    if (!env.WINTER_TOUR_DB) {
      return new Response(JSON.stringify({ error: "WINTER_TOUR_DB binding missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const url = new URL(request.url);
    const stageIdParam = url.searchParams.get("stage_id");

    if (stageIdParam && stageIdParam !== "cumulative") {
      // 1. Single Stage Rankings
      const stageId = parseInt(stageIdParam);
      
      // Load stage details
      const stage = await env.WINTER_TOUR_DB.prepare(
        "SELECT * FROM wt_stages WHERE id = ?"
      ).bind(stageId).first();

      if (!stage) {
        return new Response(JSON.stringify({ error: `Stage ${stageId} not found` }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Load results for this stage
      const { results } = await env.WINTER_TOUR_DB.prepare(
        "SELECT * FROM wt_results WHERE stage_id = ? ORDER BY category ASC, punti_total DESC"
      ).bind(stageId).all();

      const responsePayload = {
        event_details: {
          event_id: stage.zwift_event_id.toString(),
          url: stage.register_link,
          title: stage.route_it,
          start_time: stage.date,
          route: stage.route_it
        },
        race_results: results.map(r => ({
          category: r.category,
          name: r.name,
          tname: r.tname || "",
          zwid: r.zwid,
          flag: r.flag || "",
          punti_pos: r.punti_pos,
          punti_fal: r.punti_fal,
          punti_fts: r.punti_fts,
          punti_fin: r.punti_fin,
          punti_total: r.punti_total,
          tempo_pos: r.tempo_pos,
          tempo_time: r.tempo_time,
          sprinter_points: r.sprinter_points,
          climber_points: r.climber_points
        }))
      };

      return new Response(JSON.stringify(responsePayload), {
        headers: { "Content-Type": "application/json" }
      });

    } else {
      // 2. Cumulative Rankings
      // Fetch all published stages
      const { results: stages } = await env.WINTER_TOUR_DB.prepare(
        "SELECT id, stage_number FROM wt_stages WHERE status = 'published' ORDER BY stage_number ASC"
      ).all();

      const stageIds = stages.map(s => s.id);
      
      if (stageIds.length === 0) {
        return new Response(JSON.stringify({
          races_processed: 0,
          max_times_per_race: [],
          results: { A: [], B: [], C: [], D: [], E: [] }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Fetch all results for published stages
      const placeholders = stageIds.map(() => "?").join(",");
      const { results: allResults } = await env.WINTER_TOUR_DB.prepare(
        `SELECT * FROM wt_results WHERE stage_id IN (${placeholders})`
      ).bind(...stageIds).all();

      // Find max time per category for each stage (for DNF penalty)
      const maxTimesPerStage = {}; // { stageId: { cat: maxTime } }
      stageIds.forEach(id => {
        maxTimesPerStage[id] = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      });

      allResults.forEach(r => {
        const time = r.tempo_time || 0;
        if (time > maxTimesPerStage[r.stage_id][r.category]) {
          maxTimesPerStage[r.stage_id][r.category] = time;
        }
      });

      // Construct rider statistics
      const ridersMap = {}; // { zwid: { zwid, name, tname, flag, category, points, time, fts, fal, fin, pts_sprint, pts_kom, stages: { stageId: result } } }

      allResults.forEach(r => {
        if (!ridersMap[r.zwid]) {
          ridersMap[r.zwid] = {
            zwid: r.zwid,
            name: r.name,
            tname: r.tname || "",
            flag: r.flag || "",
            category: r.category,
            total: 0,
            time: 0,
            pts_sprint: 0,
            pts_kom: 0,
            fin: 0,
            fal: 0,
            fts: 0,
            stages: {}
          };
        }
        ridersMap[r.zwid].stages[r.stage_id] = r;
      });

      // Calculate totals, including absence penalties
      const cumulativeRiders = Object.values(ridersMap).map(rider => {
        const cat = rider.category;
        
        stageIds.forEach(stageId => {
          const riderStageResult = rider.stages[stageId];
          if (riderStageResult) {
            // Rider participated in this stage
            rider.total += riderStageResult.punti_total || 0;
            rider.time += riderStageResult.tempo_time || maxTimesPerStage[stageId][cat] || 0;
            rider.fin += riderStageResult.punti_fin || 0;
            rider.fal += riderStageResult.punti_fal || 0;
            rider.fts += riderStageResult.punti_fts || 0;
            rider.pts_sprint += riderStageResult.sprinter_points || 0;
            rider.pts_kom += riderStageResult.climber_points || 0;
          } else {
            // Rider missed this stage, gets the max time of their category as penalty
            rider.time += maxTimesPerStage[stageId][cat] || 0;
          }
        });

        // Delete temporary stages dictionary before output
        delete rider.stages;
        return rider;
      });

      // Group by category
      const resultsGrouped = { A: [], B: [], C: [], D: [], E: [] };
      cumulativeRiders.forEach(r => {
        if (resultsGrouped[r.category]) {
          resultsGrouped[r.category].push(r);
        }
      });

      // Format max_times_per_race array in stage order for frontend compliance
      const maxTimesPerRace = stages.map(s => maxTimesPerStage[s.id]);

      const responsePayload = {
        races_processed: stages.length,
        max_times_per_race: maxTimesPerRace,
        results: resultsGrouped
      };

      return new Response(JSON.stringify(responsePayload), {
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
