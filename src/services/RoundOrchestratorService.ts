import { D1Database } from "@cloudflare/workers-types";

type RoundSyncState = 'PENDING' | 'METADATA_DONE' | 'TEAMS_DONE' | 'ROSTER_DONE' | 'COMPLETED' | 'FAILED';

export const RoundOrchestratorService = {
  getStatus: async (db: D1Database, roundId: number | string) => {
    // We can lookup by internal id or wtrl_id
    const isWtrlId = typeof roundId === 'string' || roundId > 100000; // heuristic
    const query = isWtrlId 
      ? "SELECT sync_state as status FROM rounds WHERE wtrl_id = ?"
      : "SELECT sync_state as status FROM rounds WHERE id = ?";
      
    return await db.prepare(query).bind(roundId).first();
  },

  updateStatus: async (db: D1Database, roundId: number | string, status: RoundSyncState) => {
    const isWtrlId = typeof roundId === 'string' || roundId > 100000;
    const query = isWtrlId
      ? "UPDATE rounds SET sync_state = ?, updated_at = CURRENT_TIMESTAMP WHERE wtrl_id = ?"
      : "UPDATE rounds SET sync_state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      
    await db.prepare(query).bind(status, roundId).run();
  },

  validateStep: async (db: D1Database, roundId: number | string, requiredStatus: RoundSyncState | null) => {
    if (!requiredStatus) return;
    const current = await RoundOrchestratorService.getStatus(db, roundId);
    
    const order: RoundSyncState[] = ['PENDING', 'METADATA_DONE', 'TEAMS_DONE', 'ROSTER_DONE', 'COMPLETED'];
    const currentIndex = current ? order.indexOf(current.status as RoundSyncState) : -1;
    const requiredIndex = order.indexOf(requiredStatus) - 1;

    if (currentIndex < requiredIndex) {
        throw new Error(`Operazione non autorizzata. Stato attuale round: ${current?.status || 'PENDING'}`);
    }
  }
};
