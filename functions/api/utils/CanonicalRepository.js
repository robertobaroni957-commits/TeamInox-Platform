const RoundRepository = {
    async getCanonicalRoundsWithUserStatus(db, seasonCode, zwid) {
        const query = `
            SELECT 
                r.id, r.wtrl_id, r.season_code, r.round_number, r.name,
                r.starts_at, r.ends_at, r.sync_state,
                ra.id as race_id, ra.name as race_name, ra.date as race_date, 
                ra.world, ra.route, ra.laps, ra.raw_json,
                (SELECT status FROM availability WHERE zwid = ? AND round_id = ra.id) as status
            FROM rounds r
            LEFT JOIN zrl_round_groups rg ON r.wtrl_id = rg.external_season_id
            LEFT JOIN zrl_races ra ON rg.id = ra.zrl_round_group_id
            WHERE r.season_code = ?
            ORDER BY r.round_number, ra.id;
        `;

        const { results } = await db.prepare(query).bind(zwid, seasonCode).all();
        
        const roundsMap = new Map();

        for (const row of results) {
            if (!roundsMap.has(row.id)) {
                roundsMap.set(row.id, {
                    id: row.id,
                    wtrl_id: row.wtrl_id,
                    season_code: row.season_code,
                    round_number: row.round_number,
                    name: row.name,
                    lifecycle: {
                        starts_at: row.starts_at,
                        ends_at: row.ends_at,
                        sync_state: row.sync_state
                    },
                    races: []
                });
            }

            if (row.race_id) {
                const round = roundsMap.get(row.id);
                round.races.push({
                    id: row.race_id,
                    name: row.race_name,
                    date: row.race_date,
                    world: row.world,
                    route: row.route,
                    laps: row.raw_json ? (JSON.parse(row.raw_json).duration || row.laps || 1) : (row.laps || 1),
                    raw_json: row.raw_json,
                    status: row.status // Availability status
                });
            }
        }

        return Array.from(roundsMap.values());
    },

    async getRoundById(db, roundId) {
        const query = `
            SELECT 
                r.id, r.wtrl_id, r.season_code, r.round_number, r.name,
                r.starts_at, r.ends_at, r.sync_state,
                ra.id as race_id, ra.name as race_name, ra.date as race_date, 
                ra.world, ra.route, ra.laps, ra.raw_json
            FROM rounds r
            LEFT JOIN zrl_round_groups rg ON r.wtrl_id = rg.external_season_id
            LEFT JOIN zrl_races ra ON rg.id = ra.zrl_round_group_id
            WHERE r.id = ?
            ORDER BY ra.id;
        `;

        const { results } = await db.prepare(query).bind(roundId).all();
        if (!results || results.length === 0) return null;

        return {
            id: results[0].id,
            wtrl_id: results[0].wtrl_id,
            season_code: results[0].season_code,
            round_number: results[0].round_number,
            name: results[0].name,
            lifecycle: {
                starts_at: results[0].starts_at,
                ends_at: results[0].ends_at,
                sync_state: results[0].sync_state
            },
            races: results.filter(r => r.race_id).map(r => ({
                id: r.race_id,
                name: r.race_name,
                date: r.race_date,
                world: r.world,
                route: r.route,
                laps: r.raw_json ? (JSON.parse(r.raw_json).duration || r.laps || 1) : (r.laps || 1),
                raw_json: r.raw_json
            }))
        };
    }
};

export default RoundRepository;
