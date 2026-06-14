// functions/api/utils/roundBridge.js
export const roundBridge = {
  async getRacesByRoundV2(db, round_v2_id) {
    // 1. Prendi il wtrl_id del round
    const round = await db.prepare("SELECT wtrl_id FROM rounds_v2 WHERE id = ?").bind(round_v2_id).first();
    if (!round) return [];

    // 2. Prendi tutte le gare dal gruppo di round corrispondente
    const races = await db.prepare(`
        SELECT zr.id, zr.name, zr.date as scheduled_at, zr.world, zr.route, zrg.external_season_id
        FROM zrl_races zr
        JOIN zrl_round_groups zrg ON zr.zrl_round_group_id = zrg.id
    `).all();
    
    // 3. Filtra in JS
    return (races.results || []).filter(r => r.external_season_id === round.wtrl_id);
  },

  async validateAndPersistRaces(db, round_v2_id, data) {
    const round = await db.prepare("SELECT id FROM rounds_v2 WHERE id = ?").bind(round_v2_id).first();
    if (!round) throw new Error("INVALID_ROUND");

    // Logic to persist races via import...
    return true;
  }
};
