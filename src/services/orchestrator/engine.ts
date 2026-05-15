import { StepName, EventType, ZRLSeasonState, ZRLStateEvent } from './types';

const ALLOWED_TRANSITIONS: Record<string, StepName[]> = {
  'IDLE': ['INITIALIZING'],
  'INITIALIZING': ['SYNC_ROUNDS'],
  'SYNC_ROUNDS': ['SYNC_TEAMS'],
  'SYNC_TEAMS': ['SYNC_AVATARS'],
  'SYNC_AVATARS': ['IMPORT_RESULTS'],
  'IMPORT_RESULTS': ['COMPLETED']
};

export class ZRLOrchestrator {
  constructor(private db: any, private seasonId: number, private ownerToken: string) {}

  async runStep(step: StepName, idempotencyKey: string, logic: () => Promise<any>) {
    // 1. Acquire Lock (Lease)
    await this.acquireLock();

    // 2. State Validation
    const state = await this.rebuildState();
    if (state.currentStep !== 'IDLE' && !ALLOWED_TRANSITIONS[state.currentStep]?.includes(step)) {
      throw new Error(`Illegal Transition: ${state.currentStep} -> ${step}`);
    }

    // 3. Idempotency Check
    const idempotency = await this.db.prepare("SELECT status, result_payload FROM zrl_idempotency_keys WHERE idempotency_key = ?")
      .bind(idempotencyKey).first();
    
    if (idempotency?.status === 'COMPLETED') return JSON.parse(idempotency.result_payload);
    if (idempotency?.status === 'PENDING') throw new Error("Execution already in progress");

    // 4. Execution Phase
    await this.emit(step, 'STEP_STARTED');
    await this.db.prepare("INSERT INTO zrl_idempotency_keys (idempotency_key, status) VALUES (?, 'PENDING')")
      .bind(idempotencyKey).run();

    try {
      const result = await logic();

      // 5. Commit Phase (Atomic)
      await this.db.batch([
        this.db.prepare("UPDATE zrl_idempotency_keys SET status = 'COMPLETED', result_payload = ? WHERE idempotency_key = ?")
          .bind(JSON.stringify(result), idempotencyKey),
        this.db.prepare("INSERT INTO zrl_season_events (season_id, sequence_number, step_name, event_type, payload) VALUES (?, ?, ?, ?, ?)")
          .bind(this.seasonId, state.lastEventSequence + 1, step, 'STEP_COMPLETED', JSON.stringify(result))
      ]);
      return result;
    } catch (e: any) {
      await this.emit(step, 'STEP_FAILED', { error: e.message });
      throw e;
    }
  }

  private async acquireLock() {
    const now = Date.now();
    const result = await this.db.prepare(
      "INSERT OR REPLACE INTO zrl_orchestrator_locks (season_id, owner_token, expires_at) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM zrl_orchestrator_locks WHERE season_id = ? AND expires_at > ?)"
    ).bind(this.seasonId, this.ownerToken, now + 30000, this.seasonId, now).run();
    
    if (!result.success) throw new Error("Could not acquire orchestration lock");
  }

  private async getNextSequence(): Promise<number> {
    console.warn("LEGACY SEQUENCE PATH DETECTED: Use atomic sequencer instead");
    const result = await this.db.prepare(
      "UPDATE zrl_sequence SET current_sequence = current_sequence + 1 WHERE season_id = ? RETURNING current_sequence"
    ).bind(this.seasonId).first<{current_sequence: number}>();
    
    if (!result) {
       // Initialize if missing
       await this.db.prepare("INSERT INTO zrl_sequence (season_id, current_sequence) VALUES (?, 1)").bind(this.seasonId).run();
       return 1;
    }
    return result.current_sequence;
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

    for (const event of events.results) {
      if (event.event_type === 'STEP_COMPLETED') {
        state.currentStep = event.step_name as StepName;
        state.completedSteps.push(event.step_name as StepName);
      }
      state.lastEventSequence = event.sequence_number;
    }
    return state;
  }
}
