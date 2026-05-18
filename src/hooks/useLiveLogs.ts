import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../services/api';

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'warning' | 'error' | 'info';
  importId?: string;
  seasonId?: string;
  message: string;
  error?: string;
  duration?: number;
}

export const useLiveLogs = (seasonId: string, debug: boolean = false) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [authLevel, setAuthLevel] = useState<'full' | 'anonymous'>('anonymous');
  const pollIntervalRef = useRef<number | null>(null);

  const fetchLogs = useCallback(async () => {
    if (isUnauthorized) return;
    
    try {
      const url = `/api/admin/season/logs?seasonId=${seasonId}${debug ? '&debug=true' : ''}`;
      const response = await apiFetch<any>(url);
      setAuthLevel(response.auth_level || 'anonymous');
      setLogs(response.logs || []);
    } catch (err: any) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
        setIsUnauthorized(true);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
      console.error("Failed to fetch logs:", err);
    }
  }, [seasonId, isUnauthorized]);

  useEffect(() => {
    fetchLogs();
    
    if (!isUnauthorized) {
      pollIntervalRef.current = window.setInterval(fetchLogs, 5000);
    }
    
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchLogs, isUnauthorized]);

  return { logs, isUnauthorized, authLevel };
};
