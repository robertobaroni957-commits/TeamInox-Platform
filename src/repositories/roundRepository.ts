import { createMutation, Mutation } from '../services/db/mutationDSL';

export const RoundRepository = {
  createRounds(seasonId: number, rounds: { name: string, date: string }[]): Mutation<any> {
    const stmts = rounds.map(r => ({
      sql: "INSERT INTO rounds (series_id, name, date, status) VALUES (?, ?, ?, 'planned')",
      bind: [seasonId, r.name, r.date]
    }));

    return createMutation(stmts, {
      eventType: 'ROUND_INIT',
      payload: { seasonId, count: rounds.length }
    });
  },

  importWtrlSchedule(db: any, payload: any): Promise<Mutation<any>> {
    // Robust payload extraction
    const providedId = payload?.seasonId || payload?.payload?.seasonId;
    const schedulesSource = payload?.schedules || payload?.races || payload?.payload?.schedules || payload?.payload?.races;
    
    if (!schedulesSource) {
      const keys = payload ? Object.keys(payload).join(', ') : 'null';
      throw new Error(`Data source missing. Received keys: ${keys}. Please ensure Step 4 JSONs are pasted correctly.`);
    }

    if (!providedId) throw new Error("SeasonId is missing in RACE_IMPORT payload");

    // NEW: Resolve internal series_id from external_season_id if necessary
    // We do a lookup first
    return db.prepare("SELECT id FROM series WHERE id = ? OR external_season_id = ? ORDER BY is_active DESC LIMIT 1")
      .bind(providedId, providedId)
      .first()
      .then((series: any) => {
        if (!series) throw new Error(`Serie non trovata per ID: ${providedId}. Esegui prima il bootstrap della stagione.`);
        
        const seasonId = series.id;
        const roundsA = schedulesSource['A'] || (Array.isArray(schedulesSource) ? schedulesSource : []);
        const roundsC = schedulesSource['C'] || [];
        
        const maxRounds = Math.max(roundsA.length, roundsC.length, 6);
        const stmts: any[] = [];

        // 1. Cleanup existing rounds for this season
        stmts.push({
          sql: "DELETE FROM rounds WHERE series_id = ?",
          bind: [seasonId]
        });

        // 2. Create Merged Rounds
        for (let i = 0; i < maxRounds; i++) {
          const rA = roundsA[i] || {};
          const rC = roundsC[i] || {};
          const roundName = `Race ${i + 1}`;
          const eventDate = rA.eventDate || rC.eventDate || rA.date || rC.date || null;
          
          const strategyDetails = {
            category_details: {
              'A': { 
                world: rA.courseWorld, 
                route: rA.courseName, 
                distance: rA.distance, 
                elevation: rA.elevation,
                link: `https://zwiftinsider.com/route/${(rA.courseName || "").toLowerCase().replace(/\s+/g, '-')}/`
              },
              'B': { 
                world: rA.courseWorld, 
                route: rA.courseName, 
                distance: rA.distance, 
                elevation: rA.elevation,
                link: `https://zwiftinsider.com/route/${(rA.courseName || "").toLowerCase().replace(/\s+/g, '-')}/`
              },
              'C': { 
                world: rC.courseWorld, 
                route: rC.courseName, 
                distance: rC.distance, 
                elevation: rC.elevation,
                link: `https://zwiftinsider.com/route/${(rC.courseName || "").toLowerCase().replace(/\s+/g, '-')}/`
              },
              'D': { 
                world: rC.courseWorld, 
                route: rC.courseName, 
                distance: rC.distance, 
                elevation: rC.elevation,
                link: `https://zwiftinsider.com/route/${(rC.courseName || "").toLowerCase().replace(/\s+/g, '-')}/`
              }
            }
          };

          stmts.push({
            sql: `INSERT INTO rounds (series_id, name, date, world, route, distance, elevation, status, strategy_details) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'planned', ?)`,
            bind: [
              seasonId, 
              roundName, 
              eventDate, 
              rA.courseWorld || rC.courseWorld || 'TBD', 
              rA.courseName || rC.courseName || 'TBD', 
              rA.distance || rC.distance || 0,
              rA.elevation || rC.elevation || 0,
              JSON.stringify(strategyDetails)
            ]
          });
        }

        return createMutation(stmts, {
          eventType: 'RACE_IMPORT',
          payload: { seasonId, roundsCount: maxRounds }
        });
      });
  }
};
