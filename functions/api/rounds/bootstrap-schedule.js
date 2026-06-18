import { RoundScheduleParserService } from "../../../src/services/RoundScheduleParserService";
import { sanitize } from "../dbUtils";

/**
 * POST /api/rounds/bootstrap-schedule
 * Consumes raw text schedule and persists Rounds into the database.
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.ZRL_DB;
    const correlationId = crypto.randomUUID();

    try {
        const body = await request.json();
        const { rawText, baseYear } = body;
        
        const yearShort = (baseYear % 100).toString().padStart(2, '0');
        const nextYearShort = ((baseYear + 1) % 100).toString().padStart(2, '0');
        const season_code = `zrl_${yearShort}_${nextYearShort}`;

        if (!rawText || !baseYear) {
            return new Response(JSON.stringify({ success: false, error: "Missing rawText or baseYear", correlationId }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        let parsedRounds = RoundScheduleParserService.parse(rawText, baseYear, season_code);

        const roundsCreated = [];
        const roundsUpdated = [];
        const queries = [];

        for (const draft of parsedRounds) {
            const existing = await db.prepare(
                "SELECT id, wtrl_id FROM rounds WHERE season_code = ? AND round_number = ?"
            ).bind(sanitize(draft.season_code, 'season_code'), sanitize(draft.round_number, 'round_number')).first();

            if (existing) {
                queries.push(db.prepare(`
                    UPDATE rounds 
                    SET name = ?, starts_at = ?, ends_at = ?, sync_state = 'CREATED', updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).bind(sanitize(draft.name, 'name'), sanitize(draft.starts_at, 'starts_at'), sanitize(draft.ends_at, 'ends_at'), sanitize(existing.id, 'id')));
                roundsUpdated.push({ ...draft, id: existing.id, wtrl_id: existing.wtrl_id });
            } else {
                let baseWtrlId = 16;
                if (draft.season_code && draft.season_code.includes('zrl_26')) {
                    baseWtrlId = 20;
                }
                const wtrl_id = baseWtrlId + (draft.round_number - 1);
                
                queries.push(db.prepare(`
                    INSERT INTO rounds (round_number, name, starts_at, ends_at, season_code, sync_state, wtrl_id)
                    VALUES (?, ?, ?, ?, ?, 'CREATED', ?)
                `).bind(sanitize(draft.round_number, 'round_number'), sanitize(draft.name, 'name'), sanitize(draft.starts_at, 'starts_at'), sanitize(draft.ends_at, 'ends_at'), sanitize(draft.season_code, 'season_code'), sanitize(wtrl_id, 'wtrl_id')));
                roundsCreated.push({ ...draft, wtrl_id });
            }
        }

        if (queries.length > 0) {
            await db.batch(queries);
        }

        return new Response(JSON.stringify({ success: true, rounds_created: roundsCreated, rounds_updated: roundsUpdated, correlationId }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error(`[BootstrapSchedule] ${correlationId}:`, error);
        return new Response(JSON.stringify({ success: false, error: "INTERNAL_SERVER_ERROR", message: error.message, correlationId }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
