/**
 * Single Source of Truth per la normalizzazione del payload SeasonStatus.
 * Garantisce che ogni risposta API sia conforme allo schema SeasonStatusResponse.
 */
export function normalizeSeasonStatus(input, seasonId = null, traceId = null, auth = 'anonymous', error = null) {
    const data = input || {};

    return {
        seasonId: typeof seasonId === 'number' ? seasonId : (data.seasonId || null),
        status: data.status || 'UNKNOWN',
        lifecycle: {
            name: data.lifecycle?.name || null,
            lastUpdated: data.lifecycle?.lastUpdated || null,
            isImporting: !!data.lifecycle?.isImporting,
            isReady: !!data.lifecycle?.isReady
        },
        logs: Array.isArray(data.logs) ? data.logs.map(log => ({
            action: log.action || 'UNKNOWN',
            status: log.status || 'INFO',
            timestamp: log.timestamp || new Date().toISOString()
        })) : [],
        traceId: traceId || data.traceId || null,
        auth: auth || data.auth || 'anonymous',
        error: error || data.error || null
    };
}
