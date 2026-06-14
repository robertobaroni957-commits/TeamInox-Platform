// functions/api/utils/roundBridge.js
export const roundBridge = {
  async getRacesByRoundV2(db, round_v2_id) {
    // We now query the 'races' table directly which links to 'rounds_v2' via round_id
    const races = await db.prepare("SELECT id, round_id, name, race_type, scheduled_at FROM races WHERE round_id = ?").bind(round_v2_id).all();
    return races.results || [];
  },

  async validateAndPersistRaces(db, round_v2_id, data) {
    const round = await db.prepare("SELECT id FROM rounds_v2 WHERE id = ?").bind(round_v2_id).first();
    if (!round) throw new Error("INVALID_ROUND");

    // Logic to persist races via import...
    return true;
  }
};
