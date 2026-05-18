// Cloudflare Function to retrieve all raw data for a specific race ID


export async function onRequestGet(context) {
    const { request, env } = context;
    const db = env.ZRL_DB; // Assumes D1 binding is named DB in wrangler.toml

    const url = new URL(request.url);
    const raceId = url.searchParams.get('race_id');

    if (!raceId) {
        return new Response(JSON.stringify({ error: 'Missing race_id parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { results } = await db.prepare("SELECT file_name, json_content FROM race_data WHERE race_id = ?")
                                    .bind(raceId)
                                    .all();

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: `No data found for race ID ${raceId}` }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const raceData = {
            fal: { 'A': null, 'B': null, 'C': null, 'D': null, 'E': null }, // Populate these
            fts: { 'A': null, 'B': null, 'C': null, 'D': null, 'E': null }, // Populate these
            fin: null,
            details: null
        };

        results.forEach(row => {
            const fileName = row.file_name;
            const content = JSON.parse(row.json_content);

            if (fileName.startsWith('fal_')) {
                const cat = fileName.replace('fal_', '').replace('.json', '');
                if (raceData.fal.hasOwnProperty(cat)) {
                    raceData.fal[cat] = content;
                }
            } else if (fileName.startsWith('fts_')) {
                const cat = fileName.replace('fts_', '').replace('.json', '');
                if (raceData.fts.hasOwnProperty(cat)) {
                    raceData.fts[cat] = content;
                }
            } else if (fileName === 'fin.json') {
                raceData.fin = content;
            } else if (fileName === 'event_details.json') {
                raceData.details = content;
            }
        });

        return new Response(JSON.stringify(raceData), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error(`Error fetching race data for ${raceId}:`, error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
