import { SeasonState } from '../hooks/useSeasonStatus';

export interface Permission {
  allowed: boolean;
  reason?: string;
}

export interface PermissionMatrix {
  canBootstrap: Permission;
  canImportRaces: Permission;
  canImportTeams: Permission;
  canImportRoster: Permission;
  canCleanup: Permission;
  canArchive: Permission;
  canReactivate: Permission;
  canViewLogsFull: boolean;
}

export const getPermissionMatrix = (
  authLevel: 'full' | 'anonymous',
  lifecycle: SeasonState,
  isImporting: boolean,
  hasErrors: boolean
): PermissionMatrix => {
  const isFull = authLevel === 'full';
  
  const getDenialReason = (requiredLifecycle?: SeasonState): string | undefined => {
    if (!isFull) return "Richieste credenziali amministratore";
    if (isImporting) return "Operazione in corso...";
    if (hasErrors) return "Stagione in stato di errore. Risolvi prima di procedere.";
    if (requiredLifecycle && lifecycle !== requiredLifecycle) {
        return `Richiesto stato: ${requiredLifecycle} (Attuale: ${lifecycle})`;
    }
    return undefined;
  };

  return {
    canBootstrap: {
      allowed: isFull && !isImporting && lifecycle === 'NOT_INITIALIZED',
      reason: getDenialReason('NOT_INITIALIZED')
    },
    canImportRaces: {
      allowed: isFull && !isImporting && lifecycle === 'METADATA_DONE',
      reason: getDenialReason('METADATA_DONE')
    },
    canImportTeams: {
      allowed: isFull && !isImporting && lifecycle === 'RACES_DONE',
      reason: getDenialReason('RACES_DONE')
    },
    canImportRoster: {
      allowed: isFull && !isImporting && lifecycle === 'TEAMS_DONE',
      reason: getDenialReason('TEAMS_DONE')
    },
    canCleanup: {
      allowed: isFull && !isImporting && lifecycle === 'ROSTERS_DONE',
      reason: getDenialReason('ROSTERS_DONE')
    },
    canArchive: {
      allowed: isFull && !isImporting && lifecycle !== 'NOT_INITIALIZED',
      reason: getDenialReason()
    },
    canReactivate: {
      allowed: isFull && !isImporting && lifecycle === 'FAILED',
      reason: getDenialReason('FAILED')
    },
    canViewLogsFull: isFull
  };
};
