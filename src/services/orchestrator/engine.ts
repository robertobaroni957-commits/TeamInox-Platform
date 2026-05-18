import type { StepName, EventType, ZRLSeasonState } from './types';

const ALLOWED_TRANSITIONS: Record<string, StepName[]> = {
  'IDLE': ['INITIALIZING'],
  'INITIALIZING': ['SYNC_ROUNDS'],
  'SYNC_ROUNDS': ['SYNC_TEAMS'],
  'SYNC_TEAMS': ['SYNC_AVATARS'],
  'SYNC_AVATARS': ['IMPORT_RESULTS'],
  'IMPORT_RESULTS': ['COMPLETED']
};

export class ZRLOrchestrator {
  private db: any;
  private seasonId: number;
  private ownerToken: string;

  constructor(db: any, seasonId: number, ownerToken: string) {
    this.db = db;
    this.seasonId = seasonId;
    this.ownerToken = ownerToken;
  }

  private async emit(step: StepName, eventType: EventType, payload: any = {}) {
    try {
        const seqResult = await this.db.prepare(
          "UPDATE zrl_sequence_tracker SET current_value = current_value + 1 WHERE season_id = ? RETURNING current_value"
        ).bind(this.seasonId).first();

        const sequence = seqResult?.current_value ?? 1;

        await this.db.prepare(
          "INSERT INTO zrl_season_events (season_id, sequence_number, step_name, event_type, payload) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(this.seasonId, sequence, step, eventType, JSON.stringify(payload))
        .run();
    } catch(e) {
        console.error("Emit failed", e);
    }
  }

  async runStep(step: StepName, idempotencyKey: string, logic: () => Promise<any>) {
    await this.acquireLock();
    try {
      const state = await this.rebuildState();
      if (state.currentStep !== 'IDLE' && !ALLOWED_TRANSITIONS[state.currentStep]?.includes(step)) {
        throw new Error(`Illegal Transition: ${state.currentStep} -> ${step}`);
      }

      const idempotency = await this.db.prepare("SELECT status FROM zrl_idempotency_keys WHERE idempotency_key = ?")
        .bind(idempotencyKey).first();
      
      if (idempotency?.status === 'COMPLETED') return;
      if (idempotency?.status === 'PENDING') throw new Error("Execution in progress");

      await this.db.prepare("INSERT INTO zrl_idempotency_keys (idempotency_key, status) VALUES (?, 'PENDING')")
        .bind(idempotencyKey).run();

      const result = await logic();

      const seqResult = await this.db.prepare(
        "UPDATE zrl_sequence_tracker SET current_value = current_value + 1 WHERE season_id = ? RETURNING current_value"
      ).bind(this.seasonId).first();

      await this.db.batch([
        this.db.prepare("UPDATE zrl_idempotency_keys SET status = 'COMPLETED', result_payload = ? WHERE idempotency_key = ?")
          .bind(JSON.stringify(result), idempotencyKey),
        this.db.prepare("INSERT INTO zrl_season_events (season_id, sequence_number, step_name, event_type, payload) VALUES (?, ?, ?, ?, ?)")
          .bind(this.seasonId, seqResult?.current_value ?? 1, step, 'STEP_COMPLETED', JSON.stringify(result))
      ]);
      
      return result;
    } catch (e: any) {
      await this.emit(step, 'STEP_FAILED', { error: e.message });
      throw e;
    } finally {
      await this.releaseLock();
    }
  }

  private async acquireLock() {
    const result = await this.db.prepare(
      `INSERT INTO zrl_orchestrator_locks (season_id, owner_token, expires_at)
       VALUES (?, ?, unixepoch('now') + 30)
       ON CONFLICT(season_id) DO UPDATE SET
         owner_token = excluded.owner_token,
         expires_at = excluded.expires_at
       WHERE zrl_orchestrator_locks.expires_at < unixepoch('now')`
    ).bind(this.seasonId, this.ownerToken).run();
    
    if (result.changes === 0) throw new Error("Could not acquire lock");
  }

  private async releaseLock() {
    await this.db.prepare("DELETE FROM zrl_orchestrator_locks WHERE season_id = ? AND owner_token = ?")
      .bind(this.seasonId, this.ownerToken).run();
  }

  async rebuildState(): Promise<ZRLSeasonState> {
    const events = await this.db.prepare("SELECT * FROM zrl_season_events WHERE season_id = ? ORDER BY sequence_number ASC")
      .bind(this.seasonId).all();
    
    let state: ZRLSeasonState = { 
      seasonId: this.seasonId, 
      currentStep: 'IDLE', 
      completedSteps: [], 
      lastEventSequence: 0 
    };

    if (Array.isArray(events.results)) {
      for (const event of events.results) {
        if (event.event_type === 'STEP_COMPLETED') {
          state.currentStep = event.step_name as StepName;
          state.completedSteps.push(event.step_name as StepName);
        }
        state.lastEventSequence = event.sequence_number;
      }
    }
    return state;
  }
}

