import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../services/api';
import { SeasonStatusResponse, validateSeasonStatus } from '../contracts/seasonStatus';

export const useSeasonStatus = (seasonId: string | null) => {
  const [status, setStatus] = useState<SeasonStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const pollIntervalRef = useRef<number | null>(null);

  const fetchStatus = useCallback(async (isAutoPoll = false) => {
    if (!seasonId || isUnauthorized) return;
    
    setLoading(true);
    try {
      const url = `/api/admin/season/status?seasonId=${seasonId}`;
      const rawData = await apiFetch<any>(url);

      // Validazione e Normalizzazione via Contract
      const validatedData = validateSeasonStatus(rawData);

      setError(validatedData.error);
      setStatus(validatedData);
    } catch (err: any) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
        setIsUnauthorized(true);
        setError("Sessione scaduta.");
        return;
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [seasonId, isUnauthorized]);

  useEffect(() => {
    if (!seasonId) return;
    
    fetchStatus();
    if (isUnauthorized) return;

    // Stop polling if the season is READY or in an error state
    if (status?.status === 'READY' || error) return;

    pollIntervalRef.current = window.setInterval(() => fetchStatus(true), 5000);
    
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchStatus, isUnauthorized, status?.status, error, seasonId]);

  return { status, loading, error, refetch: fetchStatus, isUnauthorized };
};
