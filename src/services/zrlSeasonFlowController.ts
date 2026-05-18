export class ZRLSeasonFlowController {
  constructor(
    private roundService: any,
    private seasonService: any
  ) {}

  async completeAndArchiveRound(seasonYear: number, roundNumber: number) {
    // 1. VALIDATE ROUND COMPLETION
    const isComplete = await this.roundService.isRoundCompleted({
      seasonYear,
      roundNumber,
    });

    if (!isComplete) {
      throw new Error("Round cannot be archived: matches not completed");
    }

    // 2. ARCHIVE ROUND
    await this.roundService.updateRound({
      seasonYear,
      roundNumber,
      status: "ARCHIVED",
    });

    console.log(`[FLOW] Round ${roundNumber} archived`);

    // 3. GET TOTAL ROUNDS
    const config = await this.seasonService.getSeasonConfig(seasonYear);
    const totalRounds = config.totalRounds;

    // 4. IF NEXT ROUND EXISTS → UNLOCK IT
    if (roundNumber < totalRounds) {
      await this.roundService.updateRound({
        seasonYear,
        roundNumber: roundNumber + 1,
        status: "PENDING",
      });

      console.log(`[FLOW] Round ${roundNumber + 1} unlocked`);
      return;
    }

    // 5. ELSE → ARCHIVE SEASON
    await this.seasonService.archiveSeason(seasonYear);

    console.log(`[FLOW] Season ${seasonYear} archived`);
  }
}