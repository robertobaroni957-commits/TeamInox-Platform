import { api } from '../services/api';

export const WTRLImportService = {
  importTeams: async (seasonId: string, data: any) => {
    return await api.post('/admin/zrl/import/teams', { seasonId, data });
  },
  importRoster: async (seasonId: string, data: any) => {
    return await api.post('/admin/zrl/import/roster', { seasonId, data });
  }
};
