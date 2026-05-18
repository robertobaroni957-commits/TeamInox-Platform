/**
 * CONTRATTO API: SeasonStatus
 * Questo file definisce la struttura dati ufficiale per la risorsa 'SeasonStatus'.
 * Utilizzato da Backend (Cloudflare Workers) e Frontend (React) per garantire coerenza.
 */

export type SystemHealth = 'HEALTHY' | 'DEGRADED' | 'FAILING';

export interface SeasonStatusResponse {
    seasonId: number | null;
    status: string;
    systemHealth: SystemHealth;
    lifecycle: {
        name: string | null;
        lastUpdated: string | null;
        isImporting: boolean;
        isReady: boolean;
    };
    logs: Array<{
        action: string;
        status: string;
        timestamp: string;
    }>;
    traceId: string | null;
    auth: string;
    error: string | null;
}

/**
 * Validatore Runtime: normalizza e valida i dati in ingresso.
 * Garantisce che l'oggetto ricevuto rispetti il contratto.
 */
export function validateSeasonStatus(data: any): SeasonStatusResponse {
    return {
        seasonId: typeof data?.seasonId === 'number' ? data.seasonId : null,
        status: typeof data?.status === 'string' ? data.status : 'UNKNOWN',
        systemHealth: (['HEALTHY', 'DEGRADED', 'FAILING'].includes(data?.systemHealth) ? data.systemHealth : 'HEALTHY'),
        lifecycle: {
            name: typeof data?.lifecycle?.name === 'string' ? data.lifecycle.name : null,
            lastUpdated: typeof data?.lifecycle?.lastUpdated === 'string' ? data.lifecycle.lastUpdated : null,
            isImporting: !!data?.lifecycle?.isImporting,
            isReady: !!data?.lifecycle?.isReady,
        },
        logs: Array.isArray(data?.logs) ? data.logs.map((log: any) => ({
            action: typeof log?.action === 'string' ? log.action : 'UNKNOWN',
            status: typeof log?.status === 'string' ? log.status : 'INFO',
            timestamp: typeof log?.timestamp === 'string' ? log.timestamp : new Date().toISOString(),
        })) : [],
        traceId: typeof data?.traceId === 'string' ? data.traceId : null,
        auth: typeof data?.auth === 'string' ? data.auth : 'anonymous',
        error: typeof data?.error === 'string' ? data.error : null,
    };
}
