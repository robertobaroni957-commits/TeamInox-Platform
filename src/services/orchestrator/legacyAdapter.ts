
/**
 * PURE LOGIC ADAPTER
 * Logic extracted from functions/api/admin/init-season.js
 * Strictly preserves SQL semantics without side effects.
 */
export function initSeasonLogic(state: any, payload: any) {
  const { name, external_id, rounds, round_index, round_description } = payload;
  
  const seasonName = name || "ZRL 2025";
  const wtrlSeasonId = external_id || 19;
  const rIndex = round_index || 4;
  const rDesc = round_description || `Round ${rIndex} (${seasonName})`;

  // Representation of SQL operations as descriptive events/instructions
  // for the ProjectionWriter to execute inside the transaction.
  return {
    season: {
        name: seasonName,
        wtrlSeasonId: wtrlSeasonId
    },
    roundGroup: {
        roundIndex: rIndex,
        description: rDesc
    },
    rounds: rounds.map((r: any) => ({
        name: r.name,
        date: r.date,
        world: r.world,
        route: r.route,
        category: r.category || 'ALL'
    })),
    // Projection state change
    newState: {
        ...state,
        seasonName,
        lastRoundIndex: rIndex
    }
  };
}
