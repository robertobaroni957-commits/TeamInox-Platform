import { SeasonRepository } from '../../repositories/seasonRepository';
import { RoundRepository } from '../../repositories/roundRepository';
import { TeamRepository } from '../../repositories/teamRepository';
import { RosterRepository } from '../../repositories/rosterRepository';
import { Mutation } from './mutationDSL';

export async function routeMutation(db: any, intent: { type: string, payload: any }): Promise<Mutation<any>> {
  switch (intent.type) {
    case 'SEASON_BOOTSTRAP':
      return SeasonRepository.createSeason(intent.payload);
    case 'SEASON_ARCHIVE':
      return SeasonRepository.archiveSeason(intent.payload.id);
    case 'SEASON_REACTIVATE':
    case 'SEASON_ACTIVATE':
      return SeasonRepository.reactivateSeason(intent.payload.seasonId || intent.payload.id);
    case 'SEASON_RESET':
      // Reset logic (placeholder or reuse archive+reactivate)
      return SeasonRepository.reactivateSeason(intent.payload.seasonId);
    case 'ROUND_INIT':
      return RoundRepository.createRounds(intent.payload.seasonId, intent.payload.rounds);
    case 'TEAM_IMPORT':
      return TeamRepository.syncInoxTeams(intent.payload.teams);
    case 'RACE_IMPORT':
      return RoundRepository.importWtrlSchedule(db, intent.payload);
    case 'ROSTER_IMPORT':
      return RosterRepository.syncTeamMembers(intent.payload.teams);
    // Add additional cases as needed
    default:
      throw new Error(`Unknown Mutation Type: ${intent.type}`);
  }
}
