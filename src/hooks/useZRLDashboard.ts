import { useQuery, useQueryClient } from '@tanstack/react-query';
import { executeMutation } from '../services/api/mutationClient';
import { apiFetch } from '../services/api';

export function useZRLDashboard() {
  const queryClient = useQueryClient();

  const seasons = useQuery({ 
    queryKey: ['seasons'], 
    queryFn: () => apiFetch('/api/data/seasons')
  });
  
  const rounds = (seasonId: number) => useQuery({ 
    queryKey: ['rounds', seasonId], 
    queryFn: () => apiFetch(`/api/data/rounds?seasonId=${seasonId}`),
    enabled: !!seasonId 
  });
  
  const teams = useQuery({ 
    queryKey: ['teams'], 
    queryFn: () => apiFetch('/api/data/teams')
  });

  const mutate = async (type: string, payload: any, invalidateKeys: string[]) => {
    const result = await executeMutation(type, payload);
    if (result.success) {
      invalidateKeys.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
    }
    return result;
  };

  return { 
    data: { seasons, rounds, teams }, 
    mutate,
    isLoading: seasons.isLoading || teams.isLoading
  };
}
