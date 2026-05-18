export interface PipelineState {
  currentRound: number;
  status: string;
  isPaused: boolean;
  isCancelled: boolean;
  logs: any[];
}

export type Listener = (state: PipelineState) => void;

export class ZRLPipelineStore {
  constructor(storageKey: string, telemetry: any) {}

  getState(): PipelineState {
    return {
      currentRound: 1,
      status: "IDLE",
      isPaused: false,
      isCancelled: false,
      logs: []
    };
  }

  setState(partial: any) {
    console.warn("[Store] ZRLPipelineStore is now read-only. Mutation ignored.");
  }

  appendEvent(event: any) {
    console.warn("[Store] ZRLPipelineStore is now read-only. Log ignored.");
  }

  subscribe(listener: Listener) {
    return () => {};
  }

  reset() {
    console.warn("[Store] ZRLPipelineStore is now read-only. Reset ignored.");
  }
}
