import { useMemo } from 'react';
import { useSeasonStatus } from './useSeasonStatus';
import { useLiveLogs, LogEntry } from './useLiveLogs';
import { PermissionMatrix, getPermissionMatrix } from '../services/permissionMatrix';
import { safeArray } from '../utils/dataGuard';
import { SystemHealth } from '../contracts/seasonStatus';

export type SeasonBusinessState = 
  | 'IDLE' 
  | 'BOOTSTRAPPING'
  | 'IMPORTING'
  | 'READY'
  | 'UNKNOWN';

export interface SeasonRuntimeState {
  businessState: SeasonBusinessState;
  systemHealth: SystemHealth;
  seasonName: string;
  logs: LogEntry[];
  authLevel: string;
  isImporting: boolean;
  lastError: string | null;
  progress: number;
  activeStep: string | null;
  permissions: PermissionMatrix;
  isUnauthorized: boolean;
  traceId: string | null;
}

export const useSeasonRuntimeState = (seasonId: string): SeasonRuntimeState => {
  const { status, error: statusError, isUnauthorized } = useSeasonStatus(seasonId);
  const { logs } = useLiveLogs(seasonId);

  const authLevel = status?.auth === 'authenticated' ? 'full' : 'anonymous';
  
  const runtime = useMemo((): SeasonRuntimeState => {
    const lifecycleStatus = status?.status || 'UNKNOWN';
    const systemHealth = status?.systemHealth || 'HEALTHY';
    const isImporting = !!status?.lifecycle?.isImporting;

    let businessState: SeasonBusinessState = 'IDLE';
    let progress = 0;
    let activeStep = null;

    // Mapping Business State (pure, lifecycle based)
    if (status?.lifecycle?.isReady) {
      businessState = 'READY';
      progress = 100;
    } else if (lifecycleStatus === 'NOT_INITIALIZED') {
      businessState = 'BOOTSTRAPPING';
      activeStep = 'Inizializzazione Metadati';
      progress = 10;
    } else if (isImporting) {
      businessState = 'IMPORTING';
      switch (lifecycleStatus) {
        case 'METADATA_DONE':
          activeStep = 'Importazione Calendario Gare';
          progress = 30;
          break;
        case 'RACES_DONE':
          activeStep = 'Sincronizzazione Squadre WTRL';
          progress = 50;
          break;
        case 'TEAMS_DONE':
          activeStep = 'Importazione Roster Atleti';
          progress = 80;
          break;
        case 'ROSTERS_DONE':
          activeStep = 'Pulizia e Validazione Finale';
          progress = 95;
          break;
      }
    }

    const permissions = getPermissionMatrix(authLevel, lifecycleStatus, isImporting, systemHealth !== 'HEALTHY');

    const statusLogs = safeArray(status?.logs);
    const streamLogs = safeArray(logs);
    const mergedLogs = [...streamLogs, ...statusLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      businessState,
      systemHealth,
      seasonName: status?.lifecycle?.name || 'Stagione non caricata',
      logs: mergedLogs.slice(0, 50),
      authLevel,
      isImporting,
      lastError: status?.error || statusError,
      progress,
      activeStep,
      permissions,
      isUnauthorized: !!isUnauthorized,
      traceId: status?.traceId || null
    };
  }, [status, logs, statusError, authLevel, isUnauthorized]);

  return runtime;
};
