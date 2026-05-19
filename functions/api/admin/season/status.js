import { createSeasonHandler } from './apiWrapper';

export const onRequestGet = createSeasonHandler(null, async ({ env, seasonId, traceId }) => {
    const db = env.ZRL_DB;
    
    // Queries safely
    const [lifecycleRow, season, lock, eventsResult] = await Promise.all([
        db.prepare("SELECT status, updated_at FROM season_lifecycle_status WHERE season_id = ?").bind(seasonId).first(),
        db.prepare("SELECT name FROM zrl_seasons WHERE id = ?").bind(seasonId).first(),
        db.prepare("SELECT owner_token FROM zrl_orchestrator_locks WHERE season_id = ? AND expires_at > unixepoch('now')").bind(seasonId).first(),
        db.prepare("SELECT step_name, event_type, created_at FROM zrl_season_events WHERE season_id = ? ORDER BY sequence_number DESC LIMIT 5").bind(seasonId).all()
    ]);

    const logs = Array.isArray(eventsResult?.results) ? eventsResult.results.map(row => ({
        action: row.step_name || 'UNKNOWN',
        status: row.event_type || 'INFO',
        timestamp: row.created_at || new Date().toISOString()
    })) : [];

    return {
        seasonId,
        status: lifecycleRow?.status || "NOT_INITIALIZED",
        logs: logs,
        lifecycle: {
            name: season?.name || "Unknown Season",
            lastUpdated: lifecycleRow?.updated_at || null,
            isImporting: !!lock?.owner_token,
            isReady: lifecycleRow?.status === 'READY'
        },
        auth: "authenticated",
        traceId
    };
});
