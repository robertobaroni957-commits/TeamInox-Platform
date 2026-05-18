/**
 * Servizio di gestione del ciclo di vita delle stagioni ZRL.
 * Gestisce il versioning, snapshot e confronto tra stagioni.
 */

import { pipelineOrchestrator } from "./zrlPipelineOrchestrator";

export interface SeasonSnapshot {
  timestamp: number;
  state: any;
  history: any[];
}

export interface SeasonEntity {
  id: string;
  year: number;
  version: number;
  status: 'draft' | 'active' | 'archived';
  snapshots: SeasonSnapshot[];
}

class ZRLSeasonLifecycle {
  private seasons: Map<number, SeasonEntity> = new Map();

  createSeasonVersion(year: number): SeasonEntity {
    const existing = this.seasons.get(year);
    const newVersion = existing ? existing.version + 1 : 1;
    const entity: SeasonEntity = {
      id: `season_${year}_v${newVersion}`,
      year,
      version: newVersion,
      status: 'draft',
      snapshots: []
    };
    this.seasons.set(year, entity);
    return entity;
  }

  saveSnapshot(year: number) {
    const season = this.seasons.get(year);
    const instance = pipelineOrchestrator.getInstance(`pipeline_${year}`);
    if (season && instance) {
      season.snapshots.push({
        timestamp: Date.now(),
        state: instance.store.getState(),
        history: instance.telemetry.getAuditHistory()
      });
    }
  }

  compareSeasons(yearA: number, yearB: number) {
    const snapA = this.seasons.get(yearA)?.snapshots.slice(-1)[0];
    const snapB = this.seasons.get(yearB)?.snapshots.slice(-1)[0];
    
    return {
      yearA, yearB,
      diff: {
        rounds: (snapA?.state.currentRound || 0) - (snapB?.state.currentRound || 0),
        statusChanged: snapA?.state.status !== snapB?.state.status
      }
    };
  }

  cloneSeason(fromYear: number, toYear: number): SeasonEntity {
    const base = this.seasons.get(fromYear);
    if (!base) throw new Error("Base season not found");
    const newSeason = this.createSeasonVersion(toYear);
    // Logica di clone semplificata
    return newSeason;
  }
}

export const seasonLifecycle = new ZRLSeasonLifecycle();
