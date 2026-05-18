import { createMutation, Mutation } from '../services/db/mutationDSL';

export const RosterRepository = {
  syncTeamMembers(teams: any[]): Mutation<any> {
    const stmts: any[] = [];

    for (const team of teams) {
      const teamId = team.teamExternalId;
      
      // 1. Cleanup current members for this team
      stmts.push({
        sql: "DELETE FROM team_members WHERE team_id = ?",
        bind: [teamId]
      });

      for (const rider of team.riders) {
        // 2. Ensure athlete exists
        stmts.push({
          sql: `INSERT INTO athletes (zwid, name, base_category) 
                VALUES (?, ?, ?)
                ON CONFLICT(zwid) DO UPDATE SET 
                name=excluded.name, base_category=COALESCE(excluded.base_category, athletes.base_category)`,
          bind: [rider.wtrlId, rider.name, rider.category]
        });

        // 3. Add to team_members
        stmts.push({
          sql: "INSERT OR IGNORE INTO team_members (team_id, athlete_id) VALUES (?, ?)",
          bind: [teamId, rider.wtrlId]
        });
      }
    }

    return createMutation(stmts, {
      eventType: 'ROSTER_IMPORT',
      payload: { teamCount: teams.length }
    });
  }
};
