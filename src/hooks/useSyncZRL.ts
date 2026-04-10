import { useState } from 'react';
import { syncAllTeams } from '../services/zrlService';

type SyncStatus = {
  success: boolean;
  message: string;
};

export const useSyncZRL = (onSuccess?: () => void) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<SyncStatus | null>(null);

  const runSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setStatus(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const data = await syncAllTeams(controller.signal);

      if (import.meta.env.DEV) {
        console.log('SYNC RESPONSE:', data);
      }

      if (data.success) {
        setStatus({
          success: true,
          message: data.message || 'Sync completata'
        });

        onSuccess?.();
      } else {
        throw new Error(data.error || 'Errore sincronizzazione');
      }

    } catch (err: any) {
      setStatus({
        success: false,
        message: err.message || 'Errore sconosciuto'
      });
    } finally {
      clearTimeout(timeout);
      setIsSyncing(false);
    }
  };

  return { isSyncing, status, runSync };
};
