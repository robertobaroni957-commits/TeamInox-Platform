// functions/api/utils/repositoryLoader.js
import { RoundRepository } from './CanonicalRepository';

export const getRoundRepository = (db) => ({
    getCanonicalRounds: (seasonCode) => RoundRepository.getCanonicalRounds(db, seasonCode),
    getRoundById: (roundId) => RoundRepository.getRoundById(db, roundId)
});
