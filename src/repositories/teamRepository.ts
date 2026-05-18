import { createMutation, Mutation } from '../services/db/mutationDSL';

export const TeamRepository = {
  syncInoxTeams(teams: any[]): Mutation<any> {
    const stmts = teams.map(t => ({
      sql: `INSERT INTO teams (wtrl_team_id, name, division, league, zrldivision, rounds, member_count) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET 
            name=excluded.name, division=excluded.division, league=excluded.league, 
            zrldivision=excluded.zrldivision, rounds=excluded.rounds, member_count=excluded.member_count`,
      bind: [
        t.externalId, 
        t.name || "Unknown Team", 
        t.division || null, 
        t.league || null, 
        t.zrldivision || null,
        t.rounds || '[]',
        t.membersCount || 0
      ]
    }));

    return createMutation(stmts, {
      eventType: 'TEAM_IMPORT',
      payload: { count: teams.length }
    });
  }
};
