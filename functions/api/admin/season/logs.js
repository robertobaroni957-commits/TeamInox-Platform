// @ts-check
import { withSafeHandler } from '../../utils/safeHandler.js';

export const onRequestGet = withSafeHandler(async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const seasonId = url.searchParams.get("seasonId");

    if (!seasonId) throw new Error("Missing seasonId");

    const { results } = await env.ZRL_DB.prepare(
        "SELECT * FROM zrl_season_events WHERE season_id = ? ORDER BY created_at DESC LIMIT 100"
    ).bind(parseInt(seasonId)).all();

    const authLevel = context.data.user?.auth_level || 'anonymous';
    const isAnonymous = authLevel === 'anonymous';
    const traceId = context.data.traceId;

    const logs = results.map(row => {
        let payload = {};
        try {
            payload = JSON.parse(row.payload || '{}');
        } catch (e) {}

        if (isAnonymous) {
            return {
                id: row.id.toString(),
                timestamp: row.created_at,
                action: row.step_name,
                status: mapStatus(row.event_type),
            };
        }

        return {
            id: row.id.toString(),
            timestamp: row.created_at,
            action: row.step_name,
            status: mapStatus(row.event_type),
            seasonId: row.season_id.toString(),
            message: payload.message || `${row.step_name}: ${row.event_type}`,
            error: payload.error || (row.event_type === 'STEP_FAILED' ? 'Operazione fallita' : undefined),
            duration: payload.duration
        };
    });

    return new Response(JSON.stringify({
        status: "OK",
        auth_level: authLevel,
        trace_id: traceId,
        logs: isAnonymous ? logs.slice(0, 5) : logs
    }), { 
        headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        } 
    });
});

function mapStatus(eventType) {
    switch (eventType) {
        case 'STEP_COMPLETED': return 'success';
        case 'STEP_FAILED': return 'error';
        case 'STEP_STARTED': return 'info';
        case 'INTENT_CREATED': return 'info';
        default: return 'info';
    }
}
