import { D1Database } from "@cloudflare/workers-types";

const LOCK_TTL_MS = 30000; // 30 seconds

export const SequenceAllocatorService = {
  getNextSequence: async (db: D1Database, seasonId: number, workerId: string): Promise<number> => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);

    // 1. Tenta acquisizione lock (o ripresa se scaduto)
    // Se il lock esiste ma è scaduto, lo sovrascriviamo.
    const lockResult = await db.prepare(`
        INSERT INTO zrl_orchestrator_locks (season_id, owner_token, expires_at)
        VALUES (?, ?, ?)
        ON CONFLICT(season_id) DO UPDATE SET
            owner_token = excluded.owner_token,
            expires_at = excluded.expires_at
        WHERE expires_at < CURRENT_TIMESTAMP
    `).bind(seasonId, workerId, expiresAt.toISOString()).run();

    if (lockResult.meta.changes === 0) {
        throw new Error(`CONCURRENCY_ERROR: Lock non disponibile per season ${seasonId}.`);
    }

    // 2. Transazione di allocazione atomica
    const batch = [
        // Incremento sequenza
        db.prepare(
            "UPDATE zrl_sequence_tracker SET last_sequence_number = last_sequence_number + 1 WHERE season_id = ? RETURNING last_sequence_number"
        ).bind(seasonId),
        // Rilascio lock
        db.prepare("DELETE FROM zrl_orchestrator_locks WHERE season_id = ?").bind(seasonId)
    ];

    try {
        const results = await db.batch(batch);
        const updateResult = results[0];
        
        if (!updateResult.results || updateResult.results.length === 0) {
            throw new Error("Errore durante l'allocazione: la stagione non è inizializzata.");
        }
        
        return (updateResult.results[0] as any).last_sequence_number;
    } catch (err: any) {
        // In caso di fallimento batch, il lock rimane ma sarà recuperabile per scadenza
        throw err;
    }
  }
};
