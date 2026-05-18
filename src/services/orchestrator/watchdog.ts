import { D1Database } from "@cloudflare/workers-types";

export const OrchestratorWatchdog = {
    cleanupZombies: async (db: D1Database) => {
        await db.prepare("DELETE FROM zrl_orchestrator_locks WHERE expires_at < unixepoch('now')").run();
        await db.prepare("DELETE FROM zrl_idempotency_keys WHERE created_at < datetime('now', '-24 hours')").run();
    }
};
