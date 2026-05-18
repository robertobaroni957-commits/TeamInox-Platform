// @ts-check

export async function onRequestGet(context) {
    const { env, params, data } = context;
    const { traceId } = params;

    if (!traceId) {
        return new Response(JSON.stringify({ error: "Missing traceId" }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    try {
        // 1. Get all events for this trace
        const { results: events } = await env.ZRL_DB.prepare(
            "SELECT * FROM zrl_season_events WHERE trace_id = ? ORDER BY created_at ASC"
        ).bind(traceId).all();

        if (events.length === 0) {
            return new Response(JSON.stringify({ 
                error: "Trace not found", 
                traceId,
                message: "Nessun evento associato a questo ID. Potrebbe essere scaduto o non ancora persistito."
            }), { 
                status: 404, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // 2. Identify seasonId from events
        const seasonId = events[0].season_id;

        // 3. Get current status for context
        const status = await env.ZRL_DB.prepare(
            "SELECT status, updated_at FROM season_lifecycle_status WHERE season_id = ?"
        ).bind(seasonId).first();

        const debugChain = {
            traceId,
            seasonId,
            currentLifecycle: status?.status || 'UNKNOWN',
            events: events.map(e => ({
                id: e.id,
                step: e.step_name,
                type: e.event_type,
                timestamp: e.created_at,
                payload: JSON.parse(e.payload || '{}')
            }))
        };

        return new Response(JSON.stringify(debugChain), { 
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            } 
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message, traceId }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}
