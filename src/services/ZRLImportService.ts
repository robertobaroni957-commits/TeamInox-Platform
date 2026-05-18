import { D1Database } from "@cloudflare/workers-types";

interface ImportSummary {
  inserted: number;
  updated: number;
  errors: number;
  importId: string;
}

export type EntityType = 'teams' | 'roster' | 'races';

export const ZRLImportService = {
  // --- FSM & Atomic Updates ---
  updateImportStatus: async (db: D1Database, importId: string, newStatus: string) => {
    const res = await db.prepare("UPDATE wtrl_import_state SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE import_id = ?")
      .bind(newStatus, importId).run();
    if (res.meta.changes === 0) throw new Error("Stato non trovato");
  },

  // --- Core Generic Import Logic ---
  importEntity: async (db: D1Database, seasonId: number, type: EntityType, data: any[]): Promise<ImportSummary> => {
    const importId = crypto.randomUUID();
    await db.prepare("INSERT INTO wtrl_import_locks (season_id, type, import_id) VALUES (?, ?, ?)").bind(seasonId, type, importId).run();
    await db.prepare("INSERT INTO wtrl_import_state (import_id, season_id, type, status) VALUES (?, ?, ?, 'importing')").bind(importId, seasonId, type).run();
    
    let summary: ImportSummary = { inserted: 0, updated: 0, errors: 0, importId };
    
    try {
        if (type === 'teams') {
            for (const team of data) {
                await db.prepare(`INSERT INTO teams (wtrl_team_id, season_id, name, division, league, zrldivision, members_count, import_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
                    ON CONFLICT(wtrl_team_id, season_id) DO UPDATE SET name=excluded.name, import_id=excluded.import_id`)
                    .bind(team.externalId, seasonId, team.name, team.division, team.league, team.zrldivision, team.membersCount, importId).run();
                summary.inserted++;
            }
        } else if (type === 'races') {
            for (const race of data) {
                await db.prepare(`INSERT INTO zrl_races (id, zrl_round_group_id, name, date, world, route, import_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?) 
                    ON CONFLICT(id) DO UPDATE SET name=excluded.name, date=excluded.date, import_id=excluded.import_id`)
                    .bind(race.id, race.round, race.name, race.date, 'unknown', race.route, importId).run();
                summary.inserted++;
            }
        } else if (type === 'roster') {
            for (const entry of data) {
                for (const rider of entry.riders) {
                    await db.prepare(`INSERT INTO team_members (wtrl_rider_id, team_id, season_id, name, category, is_active, last_import_id) 
                        VALUES (?, ?, ?, ?, ?, 1, ?) 
                        ON CONFLICT(wtrl_rider_id, team_id, season_id) DO UPDATE SET name=excluded.name, is_active=1, last_import_id=excluded.last_import_id`)
                        .bind(rider.wtrlId, entry.teamExternalId, seasonId, rider.name, rider.category, importId).run();
                    summary.inserted++;
                }
            }
        }

        await ZRLImportService.updateImportStatus(db, importId, type === 'roster' ? 'pending_cleanup' : 'done');
        if (type !== 'roster') await db.prepare("DELETE FROM wtrl_import_locks WHERE import_id = ?").bind(importId).run();
        
        // Log snapshot
        await db.prepare("INSERT INTO wtrl_import_logs (id, type, season_id, imported_count, raw_snapshot, status) VALUES (?, ?, ?, ?, ?, 'completed')")
            .bind(importId, type, seasonId, summary.inserted, JSON.stringify(data)).run();

    } catch (e) {
        await ZRLImportService.updateImportStatus(db, importId, 'failed');
        await db.prepare("DELETE FROM wtrl_import_locks WHERE import_id = ?").bind(importId).run();
        throw e;
    }
    return summary;
  }
};
