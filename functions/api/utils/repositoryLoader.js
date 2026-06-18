// functions/api/utils/repositoryLoader.js
import RoundRepository from './CanonicalRepository';

export const getRoundRepository = (db) => ({
    getCanonicalRounds: (seasonCode) => RoundRepository.getCanonicalRoundsWithUserStatus(db, seasonCode, null),
    getCanonicalRoundsWithUserStatus: (seasonCode, zwid) => RoundRepository.getCanonicalRoundsWithUserStatus(db, seasonCode, zwid),
    getRoundById: (roundId) => RoundRepository.getRoundById(db, roundId)
});
