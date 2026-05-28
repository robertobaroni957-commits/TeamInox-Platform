import { D1Database } from "@cloudflare/workers-types";
import { SequenceAllocatorService } from "./SequenceAllocatorService";

export interface CanonicalEvent {
  id: string;
  action: string;
  seasonId: number;
  sequence_number: number;
  timestamp: string;
  version: string;
  payload: any;
  importId: string | null;
}

export const EventCanonicalizerService = {
  canonicalize: async (
    db: D1Database, 
    action: string, 
    seasonId: number, 
    payload: any, 
    importId: string | null
  ): Promise<CanonicalEvent> => {
    
    // Allocazione centralizzata tramite il Domain Service
    const sequenceNumber = await SequenceAllocatorService.getNextSequence(db, seasonId, crypto.randomUUID());
    
    return {
        id: crypto.randomUUID(),
        action,
        seasonId,
        sequence_number: sequenceNumber,
        timestamp: new Date().toISOString(),
        version: "1",
        payload: EventCanonicalizerService.sanitize(payload),
        importId
    };
  },

  sanitize: (payload: any): any => {
    if (typeof payload !== 'object' || payload === null) return payload;
    const newPayload = Array.isArray(payload) ? [...payload] : { ...payload };
    for (const key in newPayload) {
        if (key === 'temp_id' || key.startsWith('dynamic_')) {
            delete newPayload[key];
        } else if (typeof newPayload[key] === 'object') {
            newPayload[key] = EventCanonicalizerService.sanitize(newPayload[key]);
        }
    }
    return newPayload;
  }
};
