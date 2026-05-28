import { D1Database } from "@cloudflare/workers-types";
import { RoundOrchestratorService } from "./RoundOrchestratorService";
import { ZRLImportService } from "./ZRLImportService";
import { EventCanonicalizerService } from "./EventCanonicalizerService";

export type RoundAction = "IMPORT_TEAMS" | "IMPORT_METADATA" | "IMPORT_ROSTER" | "CLEANUP_ROSTER" | "SYNC_ROUND";

export const RoundActionService = {
  execute: async (db: D1Database, action: RoundAction, payload: any) => {
    const { roundId, wtrlId } = payload;
    const targetRoundId = wtrlId || roundId;
    
    if (!targetRoundId) throw new Error("Round ID or WTRL ID required for action");

    let importId = payload.importId || null;

    try {
        // 2. Esecuzione Business Logic
        switch (action) {
            case 'SYNC_ROUND':
                await RoundOrchestratorService.updateStatus(db, targetRoundId, 'METADATA_DONE');
                break;
            case 'IMPORT_TEAMS':
                // Note: ZRLImportService currently takes seasonId. We might need to update it to take roundId or derived seasonCode.
                // For now we keep compatibility if possible, or refactor ZRLImportService.
                const teamRes = await ZRLImportService.importTeams(db, payload.seasonId, payload.data);
                await RoundOrchestratorService.updateStatus(db, targetRoundId, 'TEAMS_DONE');
                importId = teamRes.importId;
                break;
            case 'IMPORT_METADATA':
                await RoundOrchestratorService.updateStatus(db, targetRoundId, 'METADATA_DONE');
                break;
            case 'IMPORT_ROSTER':
                const rostRes = await ZRLImportService.importRosterPhase1(db, payload.seasonId, payload.data);
                importId = rostRes.importId;
                break;
            case 'CLEANUP_ROSTER':
                await ZRLImportService.performRosterCleanup(db, payload.seasonId, payload.importId);
                await RoundOrchestratorService.updateStatus(db, targetRoundId, 'ROSTER_DONE');
                break;
        }

        // 3. Canonizzazione
        const event = await EventCanonicalizerService.canonicalize(
            db, action, targetRoundId, payload, importId
        );

        // 4. Scrittura Event Store (Using a more generic table name for the future)
        await db.prepare(`
            INSERT INTO round_action_log (id, action, round_id, status, payload, import_id, sequence_number, version) 
            VALUES (?, ?, ?, 'success', ?, ?, ?, ?)
        `).bind(
            event.id, event.action, targetRoundId, JSON.stringify(event.payload), 
            event.importId, event.sequence_number, event.version
        ).run();

        return { success: true, current_state: await RoundOrchestratorService.getStatus(db, targetRoundId) };
    } catch (err: any) {
        // Audit fallimento
        await db.prepare(`INSERT INTO round_action_log (id, action, round_id, status, payload) VALUES (?, ?, ?, 'failed', ?)`).bind(
            crypto.randomUUID(), action, targetRoundId, JSON.stringify(payload)
        ).run();
        throw err;
    }
  }
};
