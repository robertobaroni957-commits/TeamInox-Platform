import { useState, useCallback } from 'react';

/**
 * useNarrative - Phase 1: Minimal Deterministic Core
 * 
 * Responsibilities:
 * - IDLE -> LOADING -> SUCCESS/ERROR transitions.
 * - Basic fetch to /api/ai/generate.
 * - Minimal mapping of report.title, report.content, report.highlights.
 */

/**
 * useNarrative - Phase 3: Production Hardening
 * 
 * Responsibilities:
 * - Deterministic State Machine.
 * - Stale request rejection & Global deduplication.
 * - Anomaly normalization (SUCCESS_FALLBACK -> PARTIAL).
 */

const inFlightRequests = new Map<string, Promise<any>>();

export type NarrativeStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'PARTIAL' | 'EMPTY' | 'ERROR';

export interface NarrativeResponse {
    title: string;
    summary: string;
    sections: { type: string; content: string }[];
    stats: { label: string; value: string | number }[];
}

export function useNarrative(
    scope: 'race' | 'round' | 'season',
    params: Record<string, any>
) {
    const [status, setStatus] = useState<NarrativeStatus>('IDLE');
    const [report, setReport] = useState<NarrativeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastRequestId, setLastRequestId] = useState<number>(0);

    const fetchNarrative = useCallback(async () => {
        // 1. Validation Guard
        const roundId = params.round_id || params.roundId;
        const teamId = params.team_id || params.teamId;
        const raceId = params.race_id || params.raceId;
        if (scope === 'race' && (!roundId || !teamId || !raceId)) return;
        if (scope === 'round' && !roundId) return;
        if (scope === 'season' && !params.season_code) return;

        const fingerprint = `${scope}:${roundId}:${teamId}:${raceId}:${params.season_code}`;
        const requestId = Date.now();
        setLastRequestId(requestId);
        
        setStatus('LOADING');
        setError(null);

        // 2. Global Deduplication
        if (inFlightRequests.has(fingerprint)) {
            try {
                const cachedBody = await inFlightRequests.get(fingerprint);
                if (requestId === lastRequestId) {
                    processResponse(cachedBody);
                }
                return;
            } catch (e) { /* ignore and refetch */ }
        }

        const requestPromise = (async () => {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: scope, params })
            });

            if (response.status === 400) {
                const errData = await response.json();
                if (errData.reason === "DATA_EMPTY") return { _is_empty: true };
                throw new Error(errData.message || "Invalid request");
            }

            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            return await response.json();
        })();

        inFlightRequests.set(fingerprint, requestPromise);
        requestPromise.finally(() => inFlightRequests.delete(fingerprint));

        try {
            const body = await requestPromise;
            if (requestId === lastRequestId || lastRequestId === 0) {
                processResponse(body);
            }
        } catch (err: any) {
            if (requestId === lastRequestId || lastRequestId === 0) {
                console.error("[useNarrative] Fetch failed:", err);
                setError(err.message || 'Errore imprevisto');
                setStatus('ERROR');
            }
        }

        function processResponse(body: any) {
            if (body._is_empty) {
                setStatus('EMPTY');
                setReport(null);
                return;
            }

            if (body.success && body.report) {
                // Advanced Anomaly Normalization (Phase 3)
                if (!body.report.title || !body.report.content) {
                    setStatus('ERROR');
                    setError("Risposta AI incompleta (titolo o contenuto mancante)");
                    return;
                }

                const normalizedReport: NarrativeResponse = {
                    title: body.report.title,
                    summary: body.report.content.substring(0, 160) + '...',
                    sections: [
                        { type: 'analysis', content: body.report.content },
                        ...(body.report.highlights || []).map((h: string) => ({ type: 'highlight', content: h }))
                    ],
                    stats: body.report.stats || []
                };
                setReport(normalizedReport);
                
                // Legacy & Grounding Logic
                const isGrounded = body.report?.metadata?.grounded !== false;
                const isFallback = body.status === 'SUCCESS_FALLBACK';
                
                if (isFallback || !isGrounded) {
                    setStatus('PARTIAL');
                } else {
                    setStatus('SUCCESS');
                }
            } else {
                throw new Error("Formato risposta non valido");
            }
        }
    }, [scope, JSON.stringify(params), lastRequestId]);

    return { 
        status, 
        report, 
        error, 
        actions: { 
            fetch: fetchNarrative 
        } 
    };
}
