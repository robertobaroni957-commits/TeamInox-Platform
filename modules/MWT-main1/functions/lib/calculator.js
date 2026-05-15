// Masters Winter Tour - Core Calculation Logic
// This module contains the pure data processing functions, translated from the Python implementation.
// It is designed to be used in a Node.js environment or a Cloudflare Worker.

// --- Constants ---
const PUNTI_FIN = [100, 80, 70, 60, 55, 50, 45, 40, 36, 32, 29, 26, 24, 22, 20, 18, 16, 14, 12, 10];
const PUNTI_FTS = [25, 21, 17, 14, 11, 8, 6, 4, 2, 1];
const PUNTI_FAL = [25, 21, 17, 14, 11, 8, 6, 4, 2, 1];
const CATEGORIE = ['A', 'B', 'C', 'D', 'E'];


/**
 * Extracts and flattens rider data from raw FTS/FAL sprint objects.
 * @param {object} sprintData - The raw data from a fal_{cat}.json or fts_{cat}.json file.
 * @returns {Array} A flat list of rider sprint attempt objects.
 */
function extractRidersFromSprints(sprintData) {
    const riders = [];
    if (!sprintData || !sprintData.data) {
        return riders;
    }

    sprintData.data.forEach(sprint => {
        const uniqueSprintId = sprint.name + (sprint.lap ? ` (Lap ${sprint.lap})` : '');
        
        Object.keys(sprint).forEach(key => {
            if (key.startsWith('rider_')) {
                const rider = sprint[key];
                riders.push({
                    zwid: rider.zwid,
                    name: rider.name,
                    elapsed: parseFloat(rider.elapsed) || 0,
                    msec: parseInt(rider.msec, 10) || 0,
                    unique_sprint_id: uniqueSprintId
                });
            }
        });
    });
    return riders;
}

/**
 * Calculates sprint-based points (FAL, FTS, SPRINT, KOM) for a list of riders.
 * @param {Array} ridersFromSprints - A flat list of riders from extractRidersFromSprints.
 * @param {'FAL' | 'FTS'} mode - The calculation mode.
 * @param {object} segmentClassifications - A map of unique_sprint_id to its type (SPRINT, KOM, NONE).
 * @returns {object} An object mapping zwid to a results object.
 */
function calculateSprintPoints(ridersFromSprints, mode, segmentClassifications) {
    const puntiDaUsare = (mode === 'FAL') ? PUNTI_FAL : PUNTI_FTS;
    const risultati = {}; // { zwid: { name, fal_points, ... } }

    // Group riders by the unique segment ID
    const sprintGroups = ridersFromSprints.reduce((acc, r) => {
        if (!acc[r.unique_sprint_id]) {
            acc[r.unique_sprint_id] = [];
        }
        acc[r.unique_sprint_id].push(r);
        return acc;
    }, {});

    for (const segmentName in sprintGroups) {
        const segmentRiders = sprintGroups[segmentName];
        
        // Sort riders based on mode
        const sortKey = (mode === 'FAL') ? 'msec' : 'elapsed';
        segmentRiders.sort((a, b) => a[sortKey] - b[sortKey]);

        const classification = segmentClassifications[segmentName] || 'NONE';

        segmentRiders.forEach((rider, i) => {
            if (i < puntiDaUsare.length) {
                const points = puntiDaUsare[i];
                const zwid = rider.zwid;

                if (!risultati[zwid]) {
                    risultati[zwid] = { name: rider.name, fal_points: 0, fts_points: 0, sprint_points: 0, kom_points: 0 };
                }

                // Award points based on classification
                if (mode === 'FAL') {
                    risultati[zwid].fal_points += points;
                    if (classification === 'SPRINT') risultati[zwid].sprint_points += points;
                    else if (classification === 'KOM') risultati[zwid].kom_points += points;
                } else { // FTS
                    risultati[zwid].fts_points += points;
                    if (classification === 'SPRINT') risultati[zwid].sprint_points += points;
                    else if (classification === 'KOM') risultati[zwid].kom_points += points;
                }
            }
        });
    }
    return risultati;
}

/**
 * Calculates the complete results for a single race across all categories.
 * @param {object} raceData - Object containing fin, fal, and fts data.
 * @param {object} segmentClassifications - A map of unique_sprint_id to its type (SPRINT, KOM, NONE).
 * @returns {object} A structured object with all classifications for the single race.
 */
function calculateSingleRaceResults(raceData, segmentClassifications) {
    const classGara = {};
    const finRecords = raceData.fin ? (Array.isArray(raceData.fin.data) ? raceData.fin.data : []) : [];

    CATEGORIE.forEach(cat => {
        let punteggio = {}; // { zwid: { points object } }

        // 1. Process FINISH results
        if (finRecords.length > 0) {
            const catFinishers = finRecords.filter(f => f.category === cat);
            catFinishers.sort((a, b) => {
                const timeA = parseFloat(a.time_gun || (Array.isArray(a.time) ? a.time[0] : 0)) || 0;
                const timeB = parseFloat(b.time_gun || (Array.isArray(b.time) ? b.time[0] : 0)) || 0;
                return timeA - timeB;
            });

            catFinishers.forEach((f, i) => {
                const zwid = parseInt(f.zwid, 10);
                const pFin = (i < PUNTI_FIN.length) ? PUNTI_FIN[i] : 0;
                const raceTime = parseFloat(f.time_gun || (Array.isArray(f.time) ? f.time[0] : 0)) || 0;
                
                punteggio[zwid] = {
                    name: f.name, tname: f.tname, flag: f.flag, zwid,
                    fal: 0, fts: 0, fin: pFin,
                    pts_sprint: 0, pts_kom: 0, time: raceTime
                };
            });
        }

        // 2. Calculate FAL/FTS points
        const falRiders = extractRidersFromSprints(raceData.fal[cat]);
        const ftsRiders = extractRidersFromSprints(raceData.fts[cat]);
        const falResults = calculateSprintPoints(falRiders, 'FAL', segmentClassifications);
        const ftsResults = calculateSprintPoints(ftsRiders, 'FTS', segmentClassifications);
        const allSprintRiders = new Set([...Object.keys(falResults), ...Object.keys(ftsResults)]);

        allSprintRiders.forEach(zwid_str => {
            const zwid = parseInt(zwid_str, 10);
            if (!punteggio[zwid]) {
                const name = (falResults[zwid] || ftsResults[zwid]).name;
                punteggio[zwid] = {
                    name, tname: '', flag: '', zwid,
                    fal: 0, fts: 0, fin: 0,
                    pts_sprint: 0, pts_kom: 0, time: 0
                };
            }
            if (falResults[zwid]) {
                punteggio[zwid].fal += falResults[zwid].fal_points;
                punteggio[zwid].pts_sprint += falResults[zwid].sprint_points;
                punteggio[zwid].pts_kom += falResults[zwid].kom_points;
            }
            if (ftsResults[zwid]) {
                punteggio[zwid].fts += ftsResults[zwid].fts_points;
                punteggio[zwid].pts_sprint += ftsResults[zwid].sprint_points;
                punteggio[zwid].pts_kom += ftsResults[zwid].kom_points;
            }
        });

        // 3. Finalize and create classifications
        const riders = Object.values(punteggio).map(r => ({ ...r, total: r.fal + r.fts + r.fin }));

        const classPunti = [...riders].sort((a, b) => b.total - a.total || a.time - b.time);
        const classTempo = [...riders].sort((a, b) => {
            const timeA = a.time > 0 ? a.time : Infinity;
            const timeB = b.time > 0 ? b.time : Infinity;
            return timeA - timeB || b.total - a.total;
        });
        const classSprinter = riders.filter(r => r.pts_sprint > 0).sort((a, b) => b.pts_sprint - a.pts_sprint || b.fts - a.fts);
        const classClimber = riders.filter(r => r.pts_kom > 0).sort((a, b) => b.pts_kom - a.pts_kom || b.fts - a.fts);

        classGara[cat] = { punti: classPunti, tempo: classTempo, sprinter: classSprinter, climber: classClimber };
    });

    return classGara;
}

/**
 * Updates the cumulative results with the results from a new race.
 * @param {object} cumulativeData - The existing cumulative data object.
 * @param {object} singleRaceResults - The results object from calculateSingleRaceResults.
 * @param {object} raceData - The raw data for the single race, needed for DNF times.
 * @returns {object} The new, updated cumulative data object.
 */
function updateCumulativeResults(cumulativeData, singleRaceResults, raceData) {
    const finRecords = raceData.fin ? (Array.isArray(raceData.fin.data) ? raceData.fin.data : []) : [];
    const currentRaceMaxTimes = {};
    
    // Deep copy to avoid mutation issues
    const updatedCumulative = JSON.parse(JSON.stringify(cumulativeData));

    CATEGORIE.forEach(cat => {
        // 1. Calculate DNF time for this race/category
        const catFinishers = finRecords.filter(f => f.category === cat && (parseFloat(f.time_gun || 0)) > 0);
        const timeForDNF = catFinishers.length > 0 ? Math.max(...catFinishers.map(f => parseFloat(f.time_gun))) : 0;
        currentRaceMaxTimes[cat] = timeForDNF;

        // 2. Process riders who participated in the current race
        const ridersInRace = singleRaceResults[cat].punti;
        const currentRaceZwids = new Set(ridersInRace.map(r => r.zwid));

        ridersInRace.forEach(r => {
            const zwid = r.zwid;
            const timeToApply = r.time > 0 ? r.time : timeForDNF;

            let cumRider = updatedCumulative.results[cat].find(cr => cr.zwid === zwid);

            if (cumRider) { // Existing rider
                cumRider.name = r.name;
                cumRider.tname = r.tname;
                cumRider.fal += r.fal;
                cumRider.fts += r.fts;
                cumRider.fin += r.fin;
                cumRider.total += r.total;
                cumRider.time += timeToApply;
                cumRider.pts_sprint = (cumRider.pts_sprint || 0) + r.pts_sprint;
                cumRider.pts_kom = (cumRider.pts_kom || 0) + r.pts_kom;
            } else { // New rider
                const penaltyTime = (updatedCumulative.max_times_per_race || []).reduce((acc, pastRace) => acc + (pastRace[cat] || 0), 0);
                const newRiderData = { ...r };
                newRiderData.time = timeToApply + penaltyTime;
                updatedCumulative.results[cat].push(newRiderData);
            }
        });

        // 3. Handle absent riders
        updatedCumulative.results[cat].forEach(cumRider => {
            if (!currentRaceZwids.has(cumRider.zwid)) {
                cumRider.time += timeForDNF;
            }
        });
    });

    // 4. Update tour metadata
    updatedCumulative.races_processed = (updatedCumulative.races_processed || 0) + 1;
    if (!updatedCumulative.max_times_per_race) {
        updatedCumulative.max_times_per_race = [];
    }
    updatedCumulative.max_times_per_race.push(currentRaceMaxTimes);
    
    return updatedCumulative;
}

// Export functions for use in other modules
module.exports = {
    calculateSingleRaceResults,
    updateCumulativeResults
};
