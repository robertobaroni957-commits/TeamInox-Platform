import { apiFetch } from './api';

export class ZRLService {
  private db: any;
  constructor(db?: any) {
    this.db = db;
  }

  async importResults(payload: any) {
    console.log("Importing results", payload);
  }

  async ingestWtrlTeam(payload: any) {
    console.log("Ingesting WTRL team", payload);
  }

  async createSeason(year: number) {
    console.log("Creating season", year);
  }

  async archiveSeason(year: number) {
    console.log("Archiving season", year);
  }

  async syncAllTeams(signal?: AbortSignal) {
    return apiFetch('/api/sync-all-teams', { signal });
  }
}

export const zrlService = new ZRLService();
export const syncAllTeams = (signal?: AbortSignal) => zrlService.syncAllTeams(signal);
