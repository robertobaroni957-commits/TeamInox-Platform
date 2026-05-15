export type StepName = 
  | 'IDLE' 
  | 'INITIALIZING' 
  | 'SYNC_ROUNDS' 
  | 'SYNC_TEAMS' 
  | 'SYNC_AVATARS' 
  | 'IMPORT_RESULTS' 
  | 'COMPLETED';

export type EventType = 'INTENT_CREATED' | 'STEP_STARTED' | 'STEP_COMPLETED' | 'STEP_FAILED';

export interface ZRLStateEvent {
  seasonId: number;
  sequence: number;
  step: StepName;
  type: EventType;
  payload: any;
}

export interface ZRLSeasonState {
  seasonId: number;
  currentStep: StepName;
  completedSteps: StepName[];
  failedStep?: StepName;
  lastEventSequence: number;
}
