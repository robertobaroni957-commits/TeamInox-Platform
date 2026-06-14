// functions/api/utils/roundBridge.js
export const roundBridge = {
  async getRacesByRoundV2(db, round_v2_id) {
    // We now query the 'races' table directly which links to 'rounds_v2' via round_id
    // Note: The schema defines `CREATE TABLE races (id ..., round_id INTEGER NOT NULL ... FOREIGN KEY (round_id) REFERENCES rounds(id))`
    // If 'rounds' table was deleted, this foreign key might be broken.
    // Assuming 'races' table's 'round_id' now conceptually refers to 'rounds_v2(id)'.
    const races = await db.prepare("SELECT * FROM races WHERE round_id = ?").bind(round_v2_id).all();
    return races.results || [];
  },

  async validateAndPersistRaces(db, round_v2_id, data) {
    const round = await db.prepare("SELECT id FROM rounds_v2 WHERE id = ?").bind(round_v2_id).first();
    if (!round) throw new Error("INVALID_ROUND");

    // Logic to persist races via import...
    return true;
  }
};
