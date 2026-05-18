import { createMutation, Mutation } from '../services/db/mutationDSL';

export const SeasonRepository = {
  createSeason(config: { name: string, externalId: number }): Mutation<any> {
    const stmts = [
      { sql: "UPDATE series SET is_active = 0 WHERE is_active = 1", bind: [] },
      { 
        sql: "INSERT INTO zrl_seasons (name, external_season_id, status) VALUES (?, ?, 'PENDING')", 
        bind: [config.name, config.externalId] 
      },
      { 
        sql: "INSERT INTO series (name, external_season_id, is_active) VALUES (?, ?, 1)", 
        bind: [config.name, config.externalId] 
      }
    ];

    return createMutation(stmts, {
      eventType: 'SEASON_BOOTSTRAP',
      payload: config
    });
  },

  archiveSeason(id: number): Mutation<any> {
    return createMutation([{ sql: "UPDATE series SET is_active = 0 WHERE id = ?", bind: [id] }], {
        eventType: 'SEASON_ARCHIVE',
        payload: { id }
    });
  },

  reactivateSeason(id: number): Mutation<any> {
    return createMutation([
        { sql: "UPDATE series SET is_active = 0", bind: [] },
        { sql: "UPDATE series SET is_active = 1 WHERE id = ?", bind: [id] }
    ], {
        eventType: 'SEASON_REACTIVATE',
        payload: { id }
    });
  }
};
