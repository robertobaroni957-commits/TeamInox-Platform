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

  importTeams: async (db: D1Database, seasonId: number, data: any[]) => {
      return await ZRLImportService.importEntity(db, seasonId, 'teams', data);
  },

  importRosterPhase1: async (db: D1Database, seasonId: number, data: any[]) => {
      return await ZRLImportService.importEntity(db, seasonId, 'roster', data);
  },

  performRosterCleanup: async (db: D1Database, seasonId: number, importId: string) => {
    console.log(`[ZRLImportService] Performing Roster Cleanup for import ${importId}`);
    // Marciamo come inattivi i membri che non erano nel file appena importato per questa stagione
    await db.prepare(`
        UPDATE team_members 
        SET is_active = 0 
        WHERE season_id = ? AND last_import_id != ?
    `).bind(seasonId.toString(), importId).run();

    await ZRLImportService.updateImportStatus(db, importId, 'done');
    await db.prepare("DELETE FROM wtrl_import_locks WHERE import_id = ?").bind(importId).run();
    return { success: true };
  },

  // --- Core Generic Import Logic ---
  importEntity: async (db: D1Database, seasonId: number, type: EntityType, data: any[]): Promise<ImportSummary> => {
    const importId = crypto.randomUUID();
    // Usiamo OR REPLACE per sbloccare eventuali stati di errore precedenti
    await db.prepare("INSERT OR REPLACE INTO wtrl_import_locks (season_id, type, import_id) VALUES (?, ?, ?)").bind(seasonId, type, importId).run();
    await db.prepare("INSERT OR REPLACE INTO wtrl_import_state (import_id, season_id, type, status) VALUES (?, ?, ?, 'importing')").bind(importId, seasonId, type).run();
    
    let summary: ImportSummary = { inserted: 0, updated: 0, errors: 0, importId };
    
    try {
        if (type === 'teams') {
            for (const team of data) {
                await db.prepare(`INSERT INTO teams (wtrl_team_id, season_id, name, division, league, zrldivision, member_count, import_id) 
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
                // 1. Update team captain
                if (entry.captainId) {
                    await db.prepare("UPDATE teams SET captain_id = ? WHERE wtrl_team_id = ?")
                        .bind(entry.captainId, entry.teamExternalId).run();
                }

                // 2. Process riders and assign roles
                for (const rider of entry.riders) {
                    const wtrlRiderId = rider.wtrlId || 0;
                    const sid = (seasonId || 0).toString();
                    const name = rider.name || 'Unknown';
                    const category = rider.category || 'N/A';
                    const avatar = rider.avatar || '';
                    
                    // Verifica ruoli speciali
                    const isCaptain = (wtrlRiderId === entry.captainId);
                    const isManager = entry.managerIds && Array.isArray(entry.managerIds) 
                        ? entry.managerIds.includes(wtrlRiderId) 
                        : (wtrlRiderId === entry.managerId);
                    
                    let newRole = 'athlete';
                    if (isManager) newRole = 'moderator';
                    else if (isCaptain) newRole = 'captain';

                    // 1. UPDATE ATHLETES TABLE with role logic (escalation only)
                    await db.prepare(`
                        INSERT INTO athletes (zwid, name, base_category, avatar_url, role)
                        VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(zwid) DO UPDATE SET 
                            name = excluded.name,
                            base_category = excluded.base_category,
                            avatar_url = excluded.avatar_url,
                            role = CASE 
                                WHEN COALESCE(athletes.role, 'athlete') = 'admin' THEN 'admin'
                                WHEN excluded.role = 'moderator' THEN 'moderator'
                                WHEN excluded.role = 'captain' AND COALESCE(athletes.role, 'athlete') NOT IN ('admin', 'moderator') THEN 'captain'
                                ELSE COALESCE(athletes.role, excluded.role)
                            END
                    `).bind(wtrlRiderId, name, category, avatar, newRole).run();

                    // 2. UPDATE TEAM_MEMBERS
                    await db.prepare(`INSERT INTO team_members (athlete_id, wtrl_rider_id, team_id, season_id, name, category, is_active, last_import_id) 
                        VALUES (?, ?, ?, ?, ?, ?, 1, ?) 
                        ON CONFLICT(athlete_id, team_id, season_id) DO UPDATE SET name=excluded.name, is_active=1, last_import_id=excluded.last_import_id`)
                        .bind(wtrlRiderId, wtrlRiderId, entry.teamExternalId, sid, name, category, importId).run();
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
