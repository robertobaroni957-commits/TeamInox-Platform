import { D1Database } from "@cloudflare/workers-types";

type LifecycleStatus = 'METADATA_DONE' | 'RACES_DONE' | 'TEAMS_DONE' | 'ROSTER_DONE' | 'READY' | 'FAILED';

export const SeasonOrchestratorService = {
  getStatus: async (db: D1Database, seasonId: number) => {
    return await db.prepare("SELECT status FROM season_lifecycle_status WHERE season_id = ?").bind(seasonId).first();
  },

  updateStatus: async (db: D1Database, seasonId: number, status: LifecycleStatus) => {
    await db.prepare("INSERT INTO season_lifecycle_status (season_id, status) VALUES (?, ?) ON CONFLICT(season_id) DO UPDATE SET status = ?, updated_at = CURRENT_TIMESTAMP")
      .bind(seasonId, status, status).run();
  },

  validateStep: async (db: D1Database, seasonId: number, requiredStatus: LifecycleStatus | null) => {
    if (!requiredStatus) return;
    const current = await SeasonOrchestratorService.getStatus(db, seasonId);
    
    const order: LifecycleStatus[] = ['IDLE', 'METADATA_DONE', 'RACES_DONE', 'TEAMS_DONE', 'ROSTER_DONE', 'READY'];
    const currentIndex = current ? order.indexOf(current.status as LifecycleStatus) : -1;
    const requiredIndex = order.indexOf(requiredStatus) - 1;

    if (currentIndex < requiredIndex) {
        throw new Error(`Step non autorizzato. Stato attuale: ${current?.status || 'Nessuno'}`);
    }
  }
};
