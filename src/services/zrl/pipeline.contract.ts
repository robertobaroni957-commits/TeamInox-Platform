export type PipelineStateValue =
  | "IDLE"
  | "SEASON_INITIALIZING"
  | "SEASON_ACTIVE"
  | "ROUND_INITIALIZING"
  | "ROUND_ARCHIVING"
  | "COMPLETED"
  | "PAUSED"
  | "CANCELLED"
  | "FAILED";

export type PipelineEventName =
  | "PIPELINE_START"
  | "SEASON_CREATED"
  | "ROUND_INITIALIZED"
  | "ROUND_ARCHIVED"
  | "PIPELINE_COMPLETED"
  | "PIPELINE_PAUSED"
  | "PIPELINE_RESUMED"
  | "PIPELINE_CANCELLED"
  | "PIPELINE_ERROR";

export interface PipelineEventPayload {
  step: PipelineEventName;
  round: number;
  seasonYear: number;
  message: string;
  timestamp: number;
}

export interface PipelineEventRecord {
  id: string;
  timestamp: number;
  type: string;
  stateBefore: PipelineStateValue;
  stateAfter: PipelineStateValue;
  metadata: Record<string, any>;
}

export interface ZRLOperation {
  id: string;
  seasonId: string;
  instanceId: string;
  versionId: number;
  status: PipelineStateValue;
  timeline: PipelineEventRecord[];
  insight: any;
  contract: any;
}

export interface OperationInsight {
  nextBestAction: string;
  reason: string;
  triggerEvent: string;
  currentState: PipelineStateValue;
  riskIfIgnored: string;
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
}

export interface OperationContract {
  requiredState: PipelineStateValue;
  allowedActions: string[];
  forbiddenActions: string[];
  reasonForBlocking?: string;
  autoExecutable?: boolean;
}