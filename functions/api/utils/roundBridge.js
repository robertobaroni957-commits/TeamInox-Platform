// functions/api/utils/roundBridge.js
export const roundBridge = {
  async getRacesByRoundV2(db, round_v2_id) {
    // La tabella corretta popolata dall'importazione è 'zrl_races'
    const races = await db.prepare(`
        SELECT zr.id, zr.name, zr.date as scheduled_at, zr.world, zr.route 
        FROM zrl_races zr
        JOIN zrl_round_groups zrg ON zr.zrl_round_group_id = zrg.id
        WHERE zrg.external_season_id = (SELECT wtrl_id FROM rounds_v2 WHERE id = ?)
    `).bind(round_v2_id).all();
    
    return races.results || [];
  },

  async validateAndPersistRaces(db, round_v2_id, data) {
    const round = await db.prepare("SELECT id FROM rounds_v2 WHERE id = ?").bind(round_v2_id).first();
    if (!round) throw new Error("INVALID_ROUND");

    // Logic to persist races via import...
    return true;
  }
};
