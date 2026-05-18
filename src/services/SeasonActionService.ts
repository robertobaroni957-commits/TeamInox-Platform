import { D1Database } from "@cloudflare/workers-types";
import { SeasonLifecycleGuard } from "./SeasonLifecycleGuard";
import { SeasonOrchestratorService } from "./SeasonOrchestratorService";
import { ZRLImportService } from "./ZRLImportService";
import { EventCanonicalizerService } from "./EventCanonicalizerService";

export type SeasonAction = "IMPORT_TEAMS" | "IMPORT_RACES" | "IMPORT_ROSTER" | "CLEANUP_ROSTER" | "BOOTSTRAP_SEASON";

export const SeasonActionService = {
  execute: async (db: D1Database, action: SeasonAction, payload: any) => {
    const { seasonId } = payload;
    let importId = payload.importId || null;

    // 1. Validazione di dominio (Guard)
    await SeasonLifecycleGuard.assertActionAllowed(db, action, seasonId);

    try {
        // 2. Esecuzione Business Logic
        switch (action) {
            case 'BOOTSTRAP_SEASON':
                await SeasonOrchestratorService.updateStatus(db, seasonId, 'METADATA_DONE');
                break;
            case 'IMPORT_TEAMS':
                const teamRes = await ZRLImportService.importTeams(db, seasonId, payload.data);
                await SeasonOrchestratorService.updateStatus(db, seasonId, 'TEAMS_DONE');
                importId = teamRes.importId;
                break;
            case 'IMPORT_RACES':
                await SeasonOrchestratorService.updateStatus(db, seasonId, 'RACES_DONE');
                break;
            case 'IMPORT_ROSTER':
                const rostRes = await ZRLImportService.importRosterPhase1(db, seasonId, payload.data);
                importId = rostRes.importId;
                break;
            case 'CLEANUP_ROSTER':
                await ZRLImportService.performRosterCleanup(db, seasonId, payload.importId);
                await SeasonOrchestratorService.updateStatus(db, seasonId, 'ROSTER_DONE');
                break;
        }

        // 3. Canonizzazione (Generazione evento immutabile ed ordering atomico)
        const event = await EventCanonicalizerService.canonicalize(
            db, action, seasonId, payload, importId
        );

        // 4. Scrittura Event Store (Append-only)
        await db.prepare(`
            INSERT INTO season_action_log (id, action, season_id, status, payload, import_id, sequence_number, version) 
            VALUES (?, ?, ?, 'success', ?, ?, ?, ?)
        `).bind(
            event.id, event.action, event.seasonId, JSON.stringify(event.payload), 
            event.importId, event.sequence_number, event.version
        ).run();

        return { success: true, current_state: await SeasonOrchestratorService.getStatus(db, seasonId) };
    } catch (err: any) {
        // Audit fallimento senza sequence_number
        await db.prepare(`INSERT INTO season_action_log (id, action, season_id, status, payload) VALUES (?, ?, ?, 'failed', ?)`).bind(
            crypto.randomUUID(), action, seasonId, JSON.stringify(payload)
        ).run();
        throw err;
    }
  }
};
