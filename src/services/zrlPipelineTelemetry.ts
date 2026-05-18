/**
 * Telemetry & Audit Layer per la Pipeline ZRL.
 * Gestisce lo storico strutturato degli eventi per debug e audit.
 */

export interface PipelineEventRecord {
  id: string;
  type: string;
  timestamp: number;
  seasonYear: number;
  round?: number;
  stateBefore: string;
  stateAfter: string;
  metadata?: any;
}

const AUDIT_STORAGE_KEY = "zrl_pipeline_audit_log";

export class ZRLPipelineTelemetry {
  private storageKey: string;

  constructor(storageKey: string = AUDIT_STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  private getRecords(): PipelineEventRecord[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to parse telemetry records", e);
      return [];
    }
  }

  /**
   * Unico metodo ufficiale per registrare eventi di telemetria.
   */
  recordEvent(event: Omit<PipelineEventRecord, 'id' | 'timestamp'>) {
    try {
      const records = this.getRecords();
      const newRecord: PipelineEventRecord = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };
      records.push(newRecord);
      localStorage.setItem(this.storageKey, JSON.stringify(records));
      return newRecord;
    } catch (e) {
      console.warn("Telemetry recordEvent failed:", e);
      return null;
    }
  }

  getAuditHistory(): PipelineEventRecord[] {
    return this.getRecords();
  }

  clearHistory() {
    localStorage.removeItem(this.storageKey);
  }
}
