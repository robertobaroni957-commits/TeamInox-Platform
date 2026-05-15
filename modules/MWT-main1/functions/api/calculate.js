// Cloudflare Function to perform race calculations and update cumulative results

import { calculateSingleRaceResults, updateCumulativeResults } from '../lib/calculator'; // Relative path to calculator.js

// Constants (should be kept in sync with calculator.js)
const CATEGORIE = ['A', 'B', 'C', 'D', 'E'];

export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.DB; // Assumes D1 binding is named DB in wrangler.toml

    try {
        const { race_id, segment_classifications } = await request.json();

        if (!race_id || !segment_classifications) {
            return new Response(JSON.stringify({ error: 'Missing race_id or segment_classifications in request body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Fetch raw race data (using logic similar to /api/race_data.js)
        const raceDataResult = await db.prepare("SELECT file_name, json_content FROM race_data WHERE race_id = ?")
                                        .bind(race_id)
                                        .all();
        if (raceDataResult.results.length === 0) {
            return new Response(JSON.stringify({ error: `No raw data found for race ID ${race_id}` }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const raceData = {
            fal: { 'A': null, 'B': null, 'C': null, 'D': null, 'E': null },
            fts: { 'A': null, 'B': null, 'C': null, 'D': null, 'E': null },
            fin: null,
            details: null
        };
        raceDataResult.results.forEach(row => {
            const fileName = row.file_name;
            const content = JSON.parse(row.json_content);
            if (fileName.startsWith('fal_')) {
                const cat = fileName.replace('fal_', '').replace('.json', '');
                if (raceData.fal.hasOwnProperty(cat)) raceData.fal[cat] = content;
            } else if (fileName.startsWith('fts_')) {
                const cat = fileName.replace('fts_', '').replace('.json', '');
                if (raceData.fts.hasOwnProperty(cat)) raceData.fts[cat] = content;
            } else if (fileName === 'fin.json') {
                raceData.fin = content;
            } else if (fileName === 'event_details.json') {
                raceData.details = content;
            }
        });

        // 2. Fetch cumulative results
        const cumulativeStateResult = await db.prepare("SELECT json_value FROM app_state WHERE key = 'cumulative_results'").first();
        let cumulativeData = { races_processed: 0, max_times_per_race: [], results: {} };
        CATEGORIE.forEach(cat => cumulativeData.results[cat] = []); // Initialize empty arrays
        if (cumulativeStateResult && cumulativeStateResult.json_value) {
            const parsedCumulative = JSON.parse(cumulativeStateResult.json_value);
            // Ensure old format is handled / new keys are present
            cumulativeData = {
                races_processed: parsedCumulative.races_processed || 0,
                max_times_per_race: parsedCumulative.max_times_per_race || [],
                results: parsedCumulative.results || cumulativeData.results
            };
        }

        // 3. Perform calculations
        const singleRaceResults = calculateSingleRaceResults(raceData, segment_classifications);
        const updatedCumulativeData = updateCumulativeResults(cumulativeData, singleRaceResults, raceData);

        // 4. Persist updated cumulative results back to D1
        const updateCumulativeSql = `
            INSERT INTO app_state (key, json_value) VALUES ('cumulative_results', ?)
            ON CONFLICT(key) DO UPDATE SET json_value = EXCLUDED.json_value;
        `;
        await db.prepare(updateCumulativeSql).bind(JSON.stringify(updatedCumulativeData)).run();

        // 5. Return results to frontend
        return new Response(JSON.stringify({ single_race_results: singleRaceResults, cumulative_data: updatedCumulativeData }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error(`Error in calculate API for race ${race_id}:`, error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
