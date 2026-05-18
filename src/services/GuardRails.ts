export async function validateSeasonState(db: any, seasonId: number): Promise<{ valid: boolean; reason?: string }> {
  const series = await db.prepare("SELECT is_active FROM series WHERE external_season_id = ?").bind(seasonId).first();
  if (!series) return { valid: false, reason: "Season not found" };
  return { valid: true };
}

export async function validateRoundState(db: any, roundId: number, requiredStatus: string): Promise<{ valid: boolean; reason?: string }> {
  const round = await db.prepare("SELECT status FROM rounds WHERE id = ?").bind(roundId).first();
  if (!round) return { valid: false, reason: "Round not found" };
  if (round.status !== requiredStatus) return { valid: false, reason: `Invalid round status: ${round.status}` };
  return { valid: true };
}

export async function validateRaceCompletion(db: any, roundId: number): Promise<{ valid: boolean; reason?: string }> {
  const incomplete = await db.prepare("SELECT count(*) as c FROM results WHERE round_id = ? AND position IS NULL").bind(roundId).first();
  if (incomplete && incomplete.c > 0) return { valid: false, reason: "Incomplete race results detected" };
  return { valid: true };
}
