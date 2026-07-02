// functions/api/admin/winter-tour/maintenance.js
// Endpoint: POST /api/admin/winter-tour/maintenance
// Actions: status | reset_stage_results | reset_all_results | vacuum

export async function onRequestPost(context) {
  const { request, env, data } = context;

  const user = data?.user;
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return new Response(JSON.stringify({ error: 'Forbidden: Unauthorized access' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { action, stage_id, confirm_phrase } = body;

  if (!action) {
    return new Response(JSON.stringify({ error: "Missing 'action' field. Supported: status, reset_stage_results, reset_all_results, vacuum" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = env.WINTER_TOUR_DB;

  try {
    let result;

    switch (action) {

      // -------------------------------------------------------
      // STATUS — DB diagnostics + stage breakdown
      // -------------------------------------------------------
      case 'status': {
        const [stagesRow, resultsRow, rulesRow, settingsRow] = await Promise.all([
          db.prepare('SELECT COUNT(*) as cnt FROM wt_stages').first().catch(() => ({ cnt: 'N/A' })),
          db.prepare('SELECT COUNT(*) as cnt FROM wt_results').first().catch(() => ({ cnt: 'N/A' })),
          db.prepare('SELECT COUNT(*) as cnt FROM wt_scoring_rules').first().catch(() => ({ cnt: 'N/A' })),
          db.prepare('SELECT COUNT(*) as cnt FROM wt_settings').first().catch(() => ({ cnt: 'N/A' })),
        ]);

        const { results: stageDetails } = await db.prepare(
          'SELECT s.id, s.stage_number, s.route_it, s.date, s.status, COUNT(r.id) as result_count FROM wt_stages s LEFT JOIN wt_results r ON r.stage_id = s.id GROUP BY s.id ORDER BY s.stage_number'
        ).all();

        result = {
          counts: {
            stages: stagesRow?.cnt ?? 0,
            results: resultsRow?.cnt ?? 0,
            scoring_rules: rulesRow?.cnt ?? 0,
            settings: settingsRow?.cnt ?? 0,
          },
          stages: stageDetails,
        };
        break;
      }

      // -------------------------------------------------------
      // RESET STAGE RESULTS — delete results for one stage
      // -------------------------------------------------------
      case 'reset_stage_results': {
        if (!stage_id) {
          return new Response(JSON.stringify({ error: "Missing 'stage_id'" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const stageIdInt = parseInt(stage_id);

        // Check stage exists
        const stage = await db.prepare('SELECT id, route_it, stage_number FROM wt_stages WHERE id = ?').bind(stageIdInt).first();
        if (!stage) {
          return new Response(JSON.stringify({ error: `Stage ${stage_id} not found` }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Count results before deletion
        const countRow = await db.prepare('SELECT COUNT(*) as cnt FROM wt_results WHERE stage_id = ?').bind(stageIdInt).first();
        const deletedCount = countRow?.cnt ?? 0;

        // Delete results and reset stage status
        await db.batch([
          db.prepare('DELETE FROM wt_results WHERE stage_id = ?').bind(stageIdInt),
          db.prepare("UPDATE wt_stages SET status = 'scheduled' WHERE id = ?").bind(stageIdInt),
        ]);

        result = {
          stage_id: stageIdInt,
          stage_name: stage.route_it,
          stage_number: stage.stage_number,
          deleted_results: deletedCount,
          message: `Reset stage ${stage.stage_number} (${stage.route_it}): deleted ${deletedCount} result rows, status reset to 'scheduled'.`,
        };
        break;
      }

      // -------------------------------------------------------
      // RESET ALL RESULTS — destructive, admin-only, requires phrase
      // -------------------------------------------------------
      case 'reset_all_results': {
        // Only admin (not moderator) can do this
        if (user.role !== 'admin') {
          return new Response(JSON.stringify({ error: 'Forbidden: Only admin role can reset all results' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Require confirm phrase sent by client
        if (confirm_phrase !== 'CONFERMA') {
          return new Response(JSON.stringify({ error: "Reset aborted: confirm_phrase must be exactly 'CONFERMA'" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const countRow = await db.prepare('SELECT COUNT(*) as cnt FROM wt_results').first();
        const totalDeleted = countRow?.cnt ?? 0;

        await db.batch([
          db.prepare('DELETE FROM wt_results'),
          db.prepare("UPDATE wt_stages SET status = 'scheduled'"),
        ]);

        result = {
          deleted_results: totalDeleted,
          message: `All results deleted (${totalDeleted} rows). All stages reset to 'scheduled'.`,
        };
        break;
      }

      // -------------------------------------------------------
      // VACUUM — run PRAGMA optimize for DB health
      // -------------------------------------------------------
      case 'vacuum': {
        await db.prepare('PRAGMA optimize').run();
        result = { message: 'PRAGMA optimize executed successfully.' };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ success: true, action, ...result }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(`[maintenance.js] Error during action "${action}":`, err);
    return new Response(JSON.stringify({ error: err.message, action }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
