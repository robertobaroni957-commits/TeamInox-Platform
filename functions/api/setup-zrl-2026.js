// functions/api/setup-zrl-2026.js
export async function onRequestGET({ env }) {
  try {
    const queries = [
      env.DB.prepare("UPDATE series SET is_active = 0"),
      env.DB.prepare(`
        INSERT INTO series (name, external_season_id, scoring_type, is_active, start_date, end_date) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        'Zwift Racing League - Season 19 (Spring 2026)', 
        19, 
        'points', 
        1, 
        '2026-04-07', 
        '2026-04-28'
      ),
    ];

    const batchRes = await env.DB.batch(queries);
    const newSeriesId = batchRes[1].meta.last_row_id;

    const rounds = [
      { name: 'Round 1 (TTT)', date: '2026-04-07', world: 'FRANCE', route: 'Hell of the North' },
      { name: 'Round 2', date: '2026-04-14', world: 'WATOPIA', route: 'The Classic' },
      { name: 'Round 3', date: '2026-04-21', world: 'FRANCE', route: 'Croissant' },
      { name: 'Round 4', date: '2026-04-28', world: 'NEWYORK', route: 'Double Span Spin' },
    ];

    const roundQueries = rounds.map(r => 
      env.DB.prepare(`
        INSERT INTO rounds (series_id, name, date, world, route) 
        VALUES (?, ?, ?, ?, ?)
      `).bind(newSeriesId, r.name, r.date, r.world, r.route)
    );

    await env.DB.batch(roundQueries);

    return new Response(JSON.stringify({ 
      success: true, 
      series_id: newSeriesId,
      message: "ZRL Season 19 Initialized" 
    }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
