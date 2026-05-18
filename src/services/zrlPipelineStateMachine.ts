import type { PipelineStateValue as State } from "@zrl-contract";

/**
 * Validatore semplificato: solo stati essenziali.
 */
const VALID_TRANSITIONS: Record<State, State[]> = {
  "IDLE": ["ACTIVE"],
  "ACTIVE": ["COMPLETED"],
  "COMPLETED": ["IDLE"],
  "PENDING": ["ACTIVE"],
  "ARCHIVED": ["IDLE"],
  "FAILED": ["IDLE"]
};

export class ZRLPipelineStateMachine {
  static canTransition(from: State, to: State): boolean {
    if (from === to) return true;
    if (to === "FAILED") return true;
    
    const allowed = VALID_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }
}
