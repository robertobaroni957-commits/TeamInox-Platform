/**
 * Orchestratore di Pipeline - DISABILITATO (Read-Only)
 */

export class PipelineInstance {
  public store: any;
  public engine: any;
  public telemetry: any;
  public id: string;
  public seasonYear: number;

  constructor(id: string, seasonYear: number) {
    this.id = id;
    this.seasonYear = seasonYear;
    this.telemetry = {};
    this.store = {};
    this.engine = {};
  }
}

export class ZRLPipelineOrchestrator {
  private instances: Map<string, PipelineInstance> = new Map();

  createInstance(seasonYear: number): PipelineInstance {
    console.warn("[Orchestrator] Orchestration disabled in frontend.");
    return new PipelineInstance(`pipeline_${seasonYear}`, seasonYear);
  }

  getInstance(id: string): PipelineInstance | undefined {
    return undefined;
  }

  getAllInstances(): PipelineInstance[] {
    return [];
  }
}

export const pipelineOrchestrator = new ZRLPipelineOrchestrator();
