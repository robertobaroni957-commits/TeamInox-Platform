import { D1Database } from "@cloudflare/workers-types";
import { SeasonOrchestratorService } from "./SeasonOrchestratorService";

type Action = 'INIT' | 'IMPORT_RACES' | 'IMPORT_TEAMS' | 'IMPORT_ROSTER' | 'CLEANUP';

// Mappa azioni agli stati necessari per procedere
const ACTION_REQUIREMENTS: Record<Action, string> = {
    'INIT': 'IDLE',
    'IMPORT_RACES': 'METADATA_DONE',
    'IMPORT_TEAMS': 'RACES_DONE',
    'IMPORT_ROSTER': 'TEAMS_DONE',
    'CLEANUP': 'ROSTER_DONE'
};

const STATE_ORDER = ['IDLE', 'METADATA_DONE', 'RACES_DONE', 'TEAMS_DONE', 'ROSTER_DONE', 'READY'];

export const SeasonLifecycleGuard = {
    assertActionAllowed: async (db: D1Database, action: Action, seasonId: number) => {
        const current = await SeasonOrchestratorService.getStatus(db, seasonId);
        const currentState = current?.status || 'IDLE';
        const requiredState = ACTION_REQUIREMENTS[action];

        const currentIndex = STATE_ORDER.indexOf(currentState);
        const requiredIndex = STATE_ORDER.indexOf(requiredState);

        if (currentIndex < requiredIndex) {
            throw new Error(`INVALID_SEASON_STATE: Azione ${action} non permessa nello stato ${currentState}. Richiesto almeno ${requiredState}.`);
        }
    }
};
