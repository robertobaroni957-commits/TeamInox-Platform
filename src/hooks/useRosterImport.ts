import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../services/api';

export type ImportStatus = "idle" | "importing" | "pending_cleanup" | "cleaning" | "done" | "failed";

export const useRosterImport = (seasonId: string) => {
  const [importStatus, setImportStatus] = useState<{status: ImportStatus, import_id: string, summary: any} | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (isUnauthorized) return;
    try {
      const data = await apiFetch(`/api/admin/zrl/import/status?seasonId=${seasonId}&type=roster`);
      setImportStatus(data);
    } catch (e: any) { 
      if (e.message.includes('401') || e.message.toLowerCase().includes('unauthorized')) {
        setIsUnauthorized(true);
      }
      console.error("Polling error", e); 
    }
  }, [seasonId, isUnauthorized]);

  // Polling
  useEffect(() => {
    fetchStatus();
    if (!isUnauthorized && (importStatus?.status === 'importing' || importStatus?.status === 'cleaning')) {
      const interval = setInterval(fetchStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [importStatus?.status, fetchStatus, isUnauthorized]);

  const startImport = async (data: any) => {
    try {
      const result = await apiFetch('/api/admin/zrl/import/roster', {
          method: 'POST',
          body: JSON.stringify({ seasonId: parseInt(seasonId), data })
      });
      await fetchStatus();
      return result;
    } catch (err: any) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
        setIsUnauthorized(true);
      }
      throw err;
    }
  };

  const executeCleanup = async () => {
    if (!importStatus?.import_id) return;
    try {
      await apiFetch('/api/admin/zrl/import/roster-cleanup', {
          method: 'POST',
          body: JSON.stringify({ importId: importStatus.import_id })
      });
      await fetchStatus();
      toast.success("Roster importato e pulito!");
    } catch (err: any) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
        setIsUnauthorized(true);
      }
      throw new Error("Cleanup fallito");
    }
  };

  return { importStatus, startImport, executeCleanup, isUnauthorized };
};
