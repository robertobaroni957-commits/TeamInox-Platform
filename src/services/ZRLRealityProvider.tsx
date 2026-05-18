import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { executeMutation } from './api/mutationClient';

interface ZRLRealityContextType {
  seasons: UseQueryResult<any, Error>;
  rounds: (seasonId: number) => UseQueryResult<any, Error>;
  teams: UseQueryResult<any, Error>;
  mutate: (type: string, payload: any) => Promise<any>;
  isLoading: boolean;
  isError: boolean;
}

const ZRLRealityContext = createContext<ZRLRealityContextType | undefined>(undefined);

export function ZRLRealityProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const seasons = useQuery({
    queryKey: ['seasons'],
    queryFn: () => fetch('/api/data/seasons', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('inox_token')}` }
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch seasons');
      return res.json();
    })
  });

  const teams = useQuery({
    queryKey: ['teams'],
    queryFn: () => fetch('/api/data/teams', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('inox_token')}` }
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    })
  });

  const rounds = (seasonId: number) => useQuery({
    queryKey: ['rounds', seasonId],
    queryFn: () => fetch(`/api/data/rounds?seasonId=${seasonId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('inox_token')}` }
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch rounds');
      return res.json();
    }),
    enabled: !!seasonId
  });

  const mutate = async (type: string, payload: any) => {
    try {
      const result = await executeMutation(type, payload);
      
      // Centralized Invalidation Mapping
      const mapping: Record<string, string[]> = {
        'SEASON_BOOTSTRAP': ['seasons', 'rounds'],
        'SEASON_ARCHIVE': ['seasons'],
        'SEASON_REACTIVATE': ['seasons'],
        'ROUND_INIT': ['rounds'],
        'TEAM_SYNC': ['teams'],
        'RESULTS_SYNC': ['results', 'standings'],
        'METADATA_SYNC': ['seasons', 'rounds', 'teams'],
        'STANDINGS_SYNC': ['standings']
      };

      const keysToInvalidate = mapping[type] || ['all'];
      keysToInvalidate.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
      
      return result;
    } catch (error) {
      console.error(`Mutation ${type} failed:`, error);
      throw error;
    }
  };

  const isLoading = seasons.isLoading || teams.isLoading;
  const isError = seasons.isError || teams.isError;

  return (
    <ZRLRealityContext.Provider value={{ seasons, rounds, teams, mutate, isLoading, isError }}>
      {children}
    </ZRLRealityContext.Provider>
  );
}

export function useZRLReality() {
  const context = useContext(ZRLRealityContext);
  if (context === undefined) {
    throw new Error('useZRLReality must be used within a ZRLRealityProvider');
  }
  return context;
}
