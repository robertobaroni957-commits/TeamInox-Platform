import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { executeMutation } from './api/mutationClient';
import { apiFetch } from './api';
import type { Role } from './permissions';

interface ZRLRealityContextType {
  rounds: UseQueryResult<any[], Error>;
  getRound: (id: number | string) => UseQueryResult<any, Error>;
  seasons: UseQueryResult<any[], Error>;
  teams: UseQueryResult<any[], Error>;
  roster: UseQueryResult<any[], Error>;
  mutate: (type: string, payload: any) => Promise<any>;
  isLoading: boolean;
  isError: boolean;
}

const ZRLRealityContext = createContext<ZRLRealityContextType | undefined>(undefined);

const getCurrentRole = (): Role | null => {
  const token = localStorage.getItem('inox_token');

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.role || 'guest') as Role;
  } catch {
    return null;
  }
};

export function ZRLRealityProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const currentRole = getCurrentRole();
  const canReadAdminRoster = currentRole === 'admin' || currentRole === 'moderator';

  const rounds = useQuery({
    queryKey: ['rounds'],
    queryFn: async () => {
      const json = await apiFetch('/api/rounds');
      return Array.isArray(json) ? json : json?.data || [];
    },
    staleTime: 60_000
  });

  const getRound = (id: number | string) =>
    useQuery({
      queryKey: ['round', id],
      enabled: !!id,
      queryFn: async () => {
        return await apiFetch(`/api/rounds/${id}`);
      }
    });

  const seasons = useQuery({
    queryKey: ['seasons'],
    queryFn: async () => {
      const json = await apiFetch('/api/data/seasons');
      return Array.isArray(json) ? json : json?.data || [];
    },
    staleTime: 300_000 // Seasons change rarely now
  });

  const teams = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const json = await apiFetch('/api/data/teams');
      return Array.isArray(json) ? json : json?.data || [];
    },
    staleTime: 60_000
  });

  const roster = useQuery({
    queryKey: ['roster'],
    enabled: canReadAdminRoster,
    queryFn: async () => {
      const json = await apiFetch('/api/admin/list_users');
      return Array.isArray(json) ? json : json?.users || [];
    },
    staleTime: 300_000
  });

  const mutate = async (type: string, payload: any) => {
    const result = await executeMutation(type, payload);

    const invalidationMap: Record<string, string[]> = {
      ROUND_SYNC: ['rounds', 'round'],
      ROUND_INIT: ['rounds', 'round'],
      TEAM_SYNC: ['teams'],
      RESULTS_SYNC: ['results', 'standings'],
      METADATA_SYNC: ['seasons', 'rounds', 'teams', 'roster'],
      STANDINGS_SYNC: ['standings']
    };

    const keys = invalidationMap[type] || [];

    keys.forEach(k => {
      queryClient.invalidateQueries({ queryKey: [k] });
    });

    return result;
  };

  const isLoading = rounds.isLoading || teams.isLoading || (canReadAdminRoster && roster.isLoading);
  const isError = rounds.isError || teams.isError || (canReadAdminRoster && roster.isError);

  return (
    <ZRLRealityContext.Provider value={{
      rounds,
      getRound,
      seasons,
      teams,
      roster,
      mutate,
      isLoading,
      isError
    }}>
      {children}
    </ZRLRealityContext.Provider>
  );
}

export function useZRLReality() {
  const ctx = useContext(ZRLRealityContext);
  if (!ctx) throw new Error('useZRLReality must be used within provider');
  return ctx;
}