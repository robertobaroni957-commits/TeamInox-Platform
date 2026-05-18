export const onRequestGet = async (context) => {
    const { env, request } = context;
    const url = new URL(request.url);
    const seasonIdParam = url.searchParams.get("seasonId");
    const requestedSeasonId = seasonIdParam ? parseInt(seasonIdParam) : 0;
    const traceId = crypto.randomUUID();

    const responseTemplate = {
        seasonId: requestedSeasonId,
        status: "UNKNOWN",
        logs: [],
        lifecycle: {},
        auth: "anonymous",
        traceId: traceId
    };

    try {
        if (!requestedSeasonId || isNaN(requestedSeasonId)) {
            return new Response(JSON.stringify({ ...responseTemplate, error: "Missing or invalid seasonId" }), { status: 200 });
        }

        const db = env.ZRL_DB;
        if (!db) throw new Error("Database not available");

        // Queries safely with individual error handling
        let lifecycleRow = {};
        try {
            lifecycleRow = await db.prepare("SELECT status, updated_at FROM season_lifecycle_status WHERE season_id = ?").bind(requestedSeasonId).first() || {};
        } catch (e) {
            console.warn("Table season_lifecycle_status missing or inaccessible, continuing with empty lifecycle.");
        }

        let season = {};
        try {
            season = await db.prepare("SELECT name FROM zrl_seasons WHERE id = ?").bind(requestedSeasonId).first() || {};
        } catch (e) {
            console.warn("Table zrl_seasons missing or inaccessible, continuing with empty season info.");
        }

        let lock = {};
        try {
            lock = await db.prepare("SELECT owner_token FROM zrl_orchestrator_locks WHERE season_id = ? AND expires_at > unixepoch('now')").bind(requestedSeasonId).first() || {};
        } catch (e) {
            console.warn("Table zrl_orchestrator_locks missing or inaccessible, continuing with no lock.");
        }

        let eventsResult = { results: [] };
        try {
            eventsResult = await db.prepare("SELECT step_name, event_type, created_at FROM zrl_season_events WHERE season_id = ? ORDER BY sequence_number DESC LIMIT 5").bind(requestedSeasonId).all();
        } catch (e) {
            console.warn("Table zrl_season_events missing or inaccessible, continuing with empty logs.");
        }

        const logs = Array.isArray(eventsResult?.results) ? eventsResult.results.map(row => ({
            action: row.step_name || 'UNKNOWN',
            status: row.event_type || 'INFO',
            timestamp: row.created_at || new Date().toISOString()
        })) : [];

        const response = {
            seasonId: requestedSeasonId,
            status: lifecycleRow.status || "NOT_INITIALIZED",
            logs: logs,
            lifecycle: {
                name: season.name || "Unknown Season",
                lastUpdated: lifecycleRow.updated_at || null,
                isImporting: !!lock.owner_token,
                isReady: lifecycleRow.status === 'READY'
            },
            auth: "authenticated",
            traceId: traceId
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ 
            ...responseTemplate, 
            error: err.message || "Internal system error" 
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
