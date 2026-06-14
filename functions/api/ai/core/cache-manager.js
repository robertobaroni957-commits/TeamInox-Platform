/**
 * AI Cache Manager - Phase 9.0
 * Authority for hashing, retrieval, and persistence of AI reports.
 * Manages concurrency locks (PROCESSING state).
 */

export class AiCacheManager {
    constructor(db) {
        if (!db) throw new Error("AiCacheManager requires D1 database binding");
        this.db = db;
    }

    /**
     * Generates a deterministic SHA-256 hash for the request.
     */
    async computeHash(contract) {
        const { report_type, scope, context } = contract;
        // Scope sorting ensures deterministic hash even if keys are reordered
        const sortedScope = Object.keys(scope).sort().reduce((acc, key) => {
            acc[key] = scope[key];
            return acc;
        }, {});

        const rawData = `${report_type}|${JSON.stringify(sortedScope)}|${context.version || '3.0'}`;
        const msgUint8 = new TextEncoder().encode(rawData);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Attempts to find a valid cached report or an active lock.
     */
    async get(hash) {
        const row = await this.db.prepare(`
            SELECT content, model, created_at 
            FROM zrl_ai_reports 
            WHERE hash = ?
        `).bind(hash).first();

        if (!row) return { hit: false, locked: false, data: null };

        if (row.content === 'PROCESSING') {
            const ageMs = Date.now() - new Date(row.created_at).getTime();
            if (ageMs < 120000) { // 2 minute lock TTL
                return { hit: false, locked: true, data: null };
            }
            // Expired lock: cleanup
            await this.delete(hash);
            return { hit: false, locked: false, data: null };
        }

        return {
            hit: true,
            locked: false,
            data: {
                report: row.content,
                model: row.model,
                created_at: row.created_at
            }
        };
    }

    /**
     * Acquires a lock by inserting a 'PROCESSING' placeholder.
     */
    async lock(hash, contract) {
        const { report_type, scope } = contract;
        try {
            await this.db.prepare(`
                INSERT INTO zrl_ai_reports (round_id, team_id, report_type, content, model, hash)
                VALUES (?, ?, ?, 'PROCESSING', 'SYSTEM', ?)
            `).bind(
                scope.round_id || 0, 
                scope.team_id || 0, 
                report_type, 
                hash
            ).run();
            return true;
        } catch (e) {
            return false; // Unique constraint likely hit
        }
    }

    /**
     * Persists the final report and releases the lock.
     */
    async store(hash, content, model, contract) {
        const { report_type, scope } = contract;
        await this.db.prepare(`
            INSERT INTO zrl_ai_reports (round_id, team_id, report_type, content, model, hash)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(hash) DO UPDATE SET 
                content = excluded.content,
                created_at = CURRENT_TIMESTAMP
        `).bind(
            scope.round_id || 0,
            scope.team_id || 0,
            report_type,
            content,
            model,
            hash
        ).run();
    }

    async delete(hash) {
        await this.db.prepare("DELETE FROM zrl_ai_reports WHERE hash = ?").bind(hash).run();
    }
}
