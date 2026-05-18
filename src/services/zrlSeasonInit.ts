import { zrlService } from "./zrlService";
import { roundService } from "./roundService";

/**
 * Servizio per la gestione dell'inizializzazione della stagione ZRL.
 */

export interface InitSeasonOptions {
  seasonYear: number;
  totalRounds: number;
}

/**
 * Inizializza una nuova stagione ZRL.
 */
export async function initSeasonSimple(seasonYear: number, totalRounds: number): Promise<void> {
  try {
    console.log(`Creating season ${seasonYear}...`);
    await zrlService.createSeason(seasonYear);

    // 2. init and archive rounds
    for (let i = 1; i <= totalRounds; i++) {
      console.log(`Initializing round ${i}...`);
      await roundService.initRound(seasonYear, i);
      await roundService.archiveRound(seasonYear, i);
    }

    console.log(`Archiving season ${seasonYear}...`);
    await zrlService.archiveSeason(seasonYear);
    console.log("Season initialization completed successfully.");
  } catch (error) {
    console.error("Season initialization failed:", error);
    throw error;
  }
}
