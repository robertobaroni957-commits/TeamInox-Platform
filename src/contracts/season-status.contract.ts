export interface LogEntry {
    action: string;
    status: string;
    timestamp: string;
}

export interface LifecycleState {
    name: string;
    lastUpdated: string | null;
    isImporting: boolean;
    isReady: boolean;
}

export interface SeasonStatusResponse {
    seasonId: number;
    status: string;
    logs: LogEntry[];
    lifecycle: LifecycleState;
    auth: string;
    traceId: string;
    error?: string;
}

export const validateSeasonStatusResponse = (data: any): SeasonStatusResponse => {
    return {
        seasonId: typeof data?.seasonId === 'number' ? data.seasonId : 0,
        status: typeof data?.status === 'string' ? data.status : "UNKNOWN",
        logs: Array.isArray(data?.logs) ? data.logs : [],
        lifecycle: {
            name: typeof data?.lifecycle?.name === 'string' ? data.lifecycle.name : "Unknown",
            lastUpdated: typeof data?.lifecycle?.lastUpdated === 'string' ? data.lifecycle.lastUpdated : null,
            isImporting: !!data?.lifecycle?.isImporting,
            isReady: !!data?.lifecycle?.isReady
        },
        auth: typeof data?.auth === 'string' ? data.auth : "anonymous",
        traceId: typeof data?.traceId === 'string' ? data.traceId : "unknown"
    };
};
