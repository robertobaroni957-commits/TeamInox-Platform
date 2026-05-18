import type { PipelineEventName, PipelineCallback, PipelineEventPayload } from "@zrl-contract";
import { ZRLPipelineStore } from "./zrlPipelineStore";
import { ZRLPipelineTelemetry } from "./zrlPipelineTelemetry";

export class ZRLSeasonPipelineEngine {
  private services: any;
  private store: ZRLPipelineStore;
  private telemetry: ZRLPipelineTelemetry;
  private listeners: Map<PipelineEventName, PipelineCallback[]> = new Map();

  constructor(services: any, store: ZRLPipelineStore, telemetry: ZRLPipelineTelemetry) {
    this.services = services;
    this.store = store;
    this.telemetry = telemetry;
  }

  on(event: PipelineEventName, callback: PipelineCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: PipelineEventName, partialPayload: Omit<PipelineEventPayload, 'timestamp' | 'step'>) {
    const fullPayload: PipelineEventPayload = { 
      ...partialPayload, 
      step: event,
      timestamp: Date.now() 
    };

    if (this.telemetry?.recordEvent) {
      this.telemetry.recordEvent({
        type: event,
        seasonYear: fullPayload.seasonYear,
        round: fullPayload.round,
        stateBefore: this.store.getState().status,
        stateAfter: this.store.getState().status,
        metadata: { ...fullPayload }
      });
    }

    this.listeners.get(event)?.forEach(cb => cb(fullPayload));
    this.store.appendEvent(fullPayload);
  }

  private async waitWhilePaused(): Promise<boolean> {
    while (this.store.getState().isPaused) {
      if (this.store.getState().isCancelled) return false;
      await new Promise(r => setTimeout(r, 500));
    }
    return true;
  }

  async initSeason(seasonYear: number) {
    this.store.setState({ status: 'SEASON_INITIALIZING', isCancelled: false, isPaused: false });
    this.emit("SEASON_START", { round: 0, seasonYear, message: `Inizializzazione stagione ${seasonYear}` });

    try {
      if (this.services.zrlService?.createSeason) {
        await this.services.zrlService.createSeason(seasonYear);
      }
      this.store.setState({ status: 'ACTIVE' });
    } catch (error: any) {
      this.store.setState({ status: 'FAILED' });
      this.emit("PIPELINE_ERROR", { round: 0, seasonYear, message: error.message || "Errore init" });
    }
  }

  async startRound(seasonYear: number, round: number) {
    this.store.setState({ status: 'ACTIVE', currentRound: round });
    this.emit("ROUND_START", { round, seasonYear, message: `Round ${round} iniziato` });
    
    if (this.services.roundService?.initRound) {
        await this.services.roundService.initRound(seasonYear, round);
    }
  }

  async archiveRound(seasonYear: number, round: number) {
    // HARD GUARD: Verifica che tutte le gare siano completate
    const races = await this.services.roundService.getRacesForRound(round);
    if (races.some((r: any) => r.status !== "COMPLETED")) {
        throw new Error(`Round ${round} non può essere archiviato: gare incomplete.`);
    }

    if (this.services.roundService?.archiveRound) {
        await this.services.roundService.archiveRound(seasonYear, round);
    }
    this.emit("ROUND_ARCHIVE", { round, seasonYear, message: `Round ${round} archiviato` });
  }

  async completeSeason(seasonYear: number) {
    // HARD GUARD: Verifica che tutti i round siano archiviati
    const rounds = await this.services.roundService.getRoundsForSeason(seasonYear);
    if (rounds.some((r: any) => r.status !== "ARCHIVED")) {
        throw new Error("Stagione non può essere completata: round incompleti.");
    }

    this.store.setState({ status: 'COMPLETED' });
    this.emit("SEASON_COMPLETE", { round: 0, seasonYear, message: "Stagione completata" });
  }
}
