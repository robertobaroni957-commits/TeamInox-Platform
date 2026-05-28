// functions/api/utils/roundBridge.js
export const roundBridge = {
  async getRacesByRoundV2(db, round_v2_id) {
    const round = await db.prepare("SELECT wtrl_id FROM rounds_v2 WHERE id = ?").bind(round_v2_id).first();
    if (!round) return [];

    const series = await db.prepare("SELECT id FROM series WHERE external_season_id = ?").bind(round.wtrl_id).first();
    if (!series) return [];

    const races = await db.prepare("SELECT * FROM rounds WHERE series_id = ?").bind(series.id).all();
    return races.results || [];
  },

  async validateAndPersistRaces(db, round_v2_id, data) {
    const round = await db.prepare("SELECT id FROM rounds_v2 WHERE id = ?").bind(round_v2_id).first();
    if (!round) throw new Error("INVALID_ROUND");

    // Logic to persist races via import...
    return true;
  }
};
