/**
 * RoundOrchestrator - Centralized Write Layer
 * Coordinates all mutations related to ZRL Rounds.
 */

import { runMutation } from "../db/mutation";
import { createMutation } from "../db/mutationDSL";

export const RoundOrchestrator = {
  /**
   * Initializes a Round by fetching data from external systems (WTRL)
   * or using provided raw data, then committing to DB via MutationDSL.
   */
  async initRound(db: any, payload: { 
    year: number, 
    round_index: number, 
    rawRounds: any[], 
    wtrlSeasonId: number, 
    seriesName: string 
  }) {
    const { year, round_index, rawRounds, wtrlSeasonId, seriesName } = payload;

    const modernStatus = await db.prepare("SELECT status FROM season_lifecycle_status WHERE season_id = ?").bind(wtrlSeasonId).first();
    if (modernStatus && (modernStatus.status === 'READY' || modernStatus.status === 'LOCKED')) {
        throw new Error(`CRITICAL_GUARD: Impossibile inizializzare il round. La stagione è gestita dal Modern Lifecycle ed è in stato ${modernStatus.status}.`);
    }

    const statements = [];
    const series = await db.prepare("SELECT id FROM series WHERE external_season_id = ?").bind(wtrlSeasonId).first();
    let seriesId;
    
    if (!series) {
        const ins = await db.prepare("INSERT INTO series (name, external_season_id, is_active) VALUES (?, ?, 1) RETURNING id")
            .bind(seriesName, wtrlSeasonId).first();
        seriesId = ins.id;
    } else {
        seriesId = series.id;
        statements.push(db.prepare("UPDATE series SET name = ?, is_active = 1 WHERE id = ?").bind(seriesName, seriesId));
    }
    
    statements.push(db.prepare("UPDATE series SET is_active = 0 WHERE id != ?").bind(seriesId));

    const sub = "SELECT id FROM rounds WHERE series_id = ?";
    statements.push(db.prepare(`DELETE FROM race_lineup WHERE round_id IN (${sub})`).bind(seriesId));
    statements.push(db.prepare(`DELETE FROM availability WHERE round_id IN (${sub})`).bind(seriesId));
    statements.push(db.prepare(`DELETE FROM results WHERE round_id IN (${sub})`).bind(seriesId));
    statements.push(db.prepare(`DELETE FROM round_teams WHERE round_id IN (${sub})`).bind(seriesId));
    statements.push(db.prepare(`DELETE FROM rounds WHERE series_id = ?`).bind(seriesId));

    const validRounds = rawRounds.filter((item: any) => item.eventDate || item.date);
    for (const item of validRounds) {
        const rName = `Week ${item.race || item.round || '?'}`;
        const rDate = item.eventDate || item.date;
        const rWorld = (item.courseWorld || item.world || "TBD").toString().toUpperCase();
        const rRoute = (item.courseName || item.route || "TBD").toString();

        statements.push(db.prepare(
            "INSERT INTO rounds (series_id, name, date, world, route, status) VALUES (?, ?, ?, ?, ?, 'planned')"
        ).bind(seriesId, rName, rDate, rWorld, rRoute));
    }

    const mutation = createMutation(statements, {
        eventType: 'ROUND_INIT',
        payload: { year, round_index, wtrlSeasonId, count: validRounds.length, orchestrated: true }
    });

    await runMutation(db, mutation);
    
    return { 
      success: true, 
      seriesId, 
      count: validRounds.length,
      message: `Round ${round_index} (${year}) inizializzato correttamente.`
    };
  },

  async resetRaceWeek(db: any, roundId: number) {
    const statements = [
      db.prepare("DELETE FROM race_lineup WHERE round_id = ?").bind(roundId),
      db.prepare("DELETE FROM availability WHERE round_id = ?").bind(roundId),
      db.prepare("DELETE FROM results WHERE round_id = ?").bind(roundId),
      db.prepare("UPDATE rounds SET status = 'planned' WHERE id = ?").bind(roundId)
    ];
    const mutation = createMutation(statements, { eventType: 'RACEWEEK_RESET', payload: { roundId } });
    return await runMutation(db, mutation);
  },

  async updateRoster(db: any, payload: {
    round_id: number,
    team_id: number,
    athlete_id: number,
    role: string,
    status: string,
    action: 'ADD' | 'REMOVE'
  }) {
    const { round_id, team_id, athlete_id, role, status, action } = payload;
    let statement;

    if (action === 'ADD') {
      statement = db.prepare(`
        INSERT INTO race_lineup (round_id, team_id, athlete_id, role, status)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(round_id, athlete_id) DO UPDATE SET
          team_id = excluded.team_id, role = excluded.role, status = excluded.status
      `).bind(round_id, team_id, athlete_id, role || 'starter', status || 'confirmed');
    } else {
      statement = db.prepare(`DELETE FROM race_lineup WHERE round_id = ? AND team_id = ? AND athlete_id = ?`).bind(round_id, team_id, athlete_id);
    }

    const mutation = createMutation([statement], {
      eventType: action === 'ADD' ? 'ROSTER_ADD' : 'ROSTER_REMOVE',
      payload: { round_id, team_id, athlete_id }
    });
    return await runMutation(db, mutation);
  },

  async ingestResults(db: any, payload: { round_id: number, results: any[] }) {
    const { round_id, results } = payload;
    const statements = [];
    statements.push(db.prepare("DELETE FROM results WHERE round_id = ?").bind(round_id));

    for (const res of results) {
        if (res.data && res.data.payload) {
            for (const row of res.data.payload) {
                statements.push(db.prepare(`
                    INSERT INTO results (round_id, zwid, name, team, time, points_total, category)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).bind(round_id, row.zwid, row.name, row.team, row.time, row.points_total, res.key));
            }
        }
    }
    statements.push(db.prepare("UPDATE rounds SET status = 'completed' WHERE id = ?").bind(round_id));

    const mutation = createMutation(statements, { eventType: 'RESULTS_INGESTION', payload: { round_id, count: results.length } });
    return await runMutation(db, mutation);
  },

  async syncMatchups(db: any, payload: { series_id: number, teams: any[] }) {
    const { series_id, teams } = payload;
    const statements = [];
    const rounds = await db.prepare("SELECT id FROM rounds WHERE series_id = ?").all();
    const roundIds = rounds.results.map((r: any) => r.id);

    if (roundIds.length === 0) throw new Error("Nessun round trovato.");

    const sub = `(${roundIds.join(',')})`;
    statements.push(db.prepare(`DELETE FROM round_teams WHERE round_id IN ${sub}`));

    for (const team of teams) {
      for (const rid of roundIds) {
        statements.push(db.prepare(`INSERT INTO round_teams (round_id, team_id, category) VALUES (?, ?, ?)`).bind(rid, team.wtrl_team_id, team.category));
      }
    }

    const mutation = createMutation(statements, { eventType: 'MATCHUP_SYNC', payload: { series_id, teamCount: teams.length } });
    return await runMutation(db, mutation);
  },

  async updateAvailability(db: any, payload: { athlete_id: number, round_id: number, status: string }) {
    const { athlete_id, round_id, status } = payload;
    const statement = db.prepare(`
        INSERT OR REPLACE INTO availability (athlete_id, round_id, status, updated_at) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(athlete_id, round_id, status);

    const mutation = createMutation([statement], {
        eventType: 'AVAILABILITY_UPDATE',
        payload: { athlete_id, round_id, status }
    });

    return await runMutation(db, mutation);
  }
};
