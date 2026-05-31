import { RoundScheduleParserService } from "../../../src/services/RoundScheduleParserService";

/**
 * POST /api/rounds/bootstrap-schedule
 * Consumes raw text schedule and persists Rounds into the database.
 * 
 * Payload:
 * {
 *   "rawText": "Round 1\n16th Sep...",
 *   "baseYear": 2026,
 *   "season_code": "zrl_2026_27"
 * }
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.ZRL_DB;
    const correlationId = crypto.randomUUID();

    try {
        const body = await request.json();
        const { rawText, baseYear } = body;
        
        // Generazione standardizzata: zrl_YY_YY+1
        const yearShort = (baseYear % 100).toString().padStart(2, '0');
        const nextYearShort = ((baseYear + 1) % 100).toString().padStart(2, '0');
        const season_code = `zrl_${yearShort}_${nextYearShort}`;

        if (!rawText || !baseYear) {
            return new Response(JSON.stringify({
                success: false,
                error: "Missing rawText or baseYear",
                correlationId
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // 1. Parse Schedule
        let parsedRounds;
        try {
            parsedRounds = RoundScheduleParserService.parse(rawText, baseYear, season_code);
            console.log("[BootstrapSchedule] Parsed rounds:", JSON.stringify(parsedRounds));
        } catch (parseError) {
            console.error("[BootstrapSchedule] Parsing failed:", parseError);
            return new Response(JSON.stringify({
                success: false,
                error: "PARSING_ERROR",
                message: parseError.message,
                correlationId
            }), { status: 422, headers: { 'Content-Type': 'application/json' } });
        }

        if (parsedRounds.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: "NO_ROUNDS_FOUND",
                correlationId
            }), { status: 422, headers: { 'Content-Type': 'application/json' } });
        }

        // 2. Persist Rounds with Idempotency (Transaction)
        const roundsCreated = [];
        const roundsUpdated = [];
        const queries = [];

        // We use season_code + round_number as the logical key for idempotency during bootstrap
        for (const draft of parsedRounds) {
            console.log("[BootstrapSchedule] Processing draft:", JSON.stringify(draft));
            try {
                const existing = await db.prepare(
                    "SELECT id, wtrl_id FROM rounds_v2 WHERE season_code = ? AND round_number = ?"
                ).bind(draft.season_code || null, draft.round_number).first();

                if (existing) {
                    // UPDATE
                    console.log("[BootstrapSchedule] Updating existing round:", existing.id);
                    queries.push(db.prepare(`
                        UPDATE rounds_v2 
                        SET name = ?, starts_at = ?, ends_at = ?, sync_state = 'CREATED', updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).bind(draft.name, draft.starts_at, draft.ends_at, existing.id));
                    roundsUpdated.push({ ...draft, id: existing.id, wtrl_id: existing.wtrl_id });
                } else {
                    // INSERT
                    // Logic: 25/26 = 16 (16+0), 26/27 = 20 (16+4).
                    // If season starts with 25 -> offset 16. If 26 -> offset 20.
                    let baseWtrlId = 16;
                    if (draft.season_code && draft.season_code.includes('zrl_26')) {
                        baseWtrlId = 20;
                    }
                    const wtrl_id = baseWtrlId + (draft.round_number - 1);
                    console.log("[BootstrapSchedule] Inserting new round with wtrl_id:", wtrl_id);
                    
                    queries.push(db.prepare(`
                        INSERT INTO rounds_v2 (round_number, name, starts_at, ends_at, season_code, sync_state, wtrl_id)
                        VALUES (?, ?, ?, ?, ?, 'CREATED', ?)
                    `).bind(draft.round_number, draft.name, draft.starts_at, draft.ends_at, draft.season_code || null, wtrl_id));
                    roundsCreated.push({ ...draft, wtrl_id });
                }
            } catch (dbErr) {
                console.error("[BootstrapSchedule] DB Query preparation failed:", dbErr);
                throw dbErr;
            }
        }

        // Execute batch
        if (queries.length > 0) {
            try {
                await db.batch(queries);
            } catch (batchErr) {
                console.error("[BootstrapSchedule] Batch execution failed:", batchErr);
                throw batchErr;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            rounds_created: roundsCreated,
            rounds_updated: roundsUpdated,
            correlationId
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error(`[BootstrapSchedule] ${correlationId}:`, error);
        return new Response(JSON.stringify({
            success: false,
            error: "INTERNAL_SERVER_ERROR",
            message: error.message,
            correlationId
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
