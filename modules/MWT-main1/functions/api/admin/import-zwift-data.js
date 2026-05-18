// functions/api/admin/import-zwift-data.js
import * as jose from 'jose';

const ALG = 'HS256';

// --- Helper Functions (Auth, Crypto, etc.) ---
async function verifyToken(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Authorization header mancante o malformato.');
    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    try {
        const { payload } = await jose.jwtVerify(token, secret, { algorithms: [ALG] });
        if (!payload.userId) throw new Error('Token non valido: userId mancante.');
        return payload;
    } catch (err) {
        throw new Error('Token non valido o scaduto.');
    }
}

async function getKey(secret) {
    const keyData = new TextEncoder().encode(secret);
    const hash = await crypto.subtle.digest('SHA-256', keyData);
    return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function decrypt(encryptedText, secret) {
    const key = await getKey(secret);
    const parts = encryptedText.split(':');
    if (parts.length !== 2) throw new Error("Formato password criptata non valido.");
    const iv = new Uint8Array(atob(parts[0]).split('').map(char => char.charCodeAt(0)));
    const encryptedData = new Uint8Array(atob(parts[1]).split('').map(char => char.charCodeAt(0)));
    const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, encryptedData);
    return new TextDecoder().decode(decryptedData);
}

// --- ZwiftPower Interaction Functions ---
async function loginToZwiftPower(env, username, password) {
    const sessionHeaders = new Headers({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36)' });
    console.log("🔐 Inizio login su ZwiftPower...");
    const r1 = await fetch("https://zwiftpower.com/ucp.php?mode=login&login=external&oauth_service=oauthzpsso", { method: 'GET', headers: sessionHeaders, redirect: 'manual' });
    if (r1.headers.has('set-cookie')) sessionHeaders.set('cookie', r1.headers.get('set-cookie'));
    const loginPageUrl = r1.headers.get('location');
    const r2 = await fetch(loginPageUrl, { method: 'GET', headers: sessionHeaders, redirect: 'manual' });
    if (r2.headers.has('set-cookie')) sessionHeaders.append('cookie', r2.headers.get('set-cookie'));
    const body = await r2.text();
    const actionMatch = body.match(/<form[^>]+id="form"[^>]+action=\"([^\"]+)\"/);
    if (!actionMatch) throw new Error("Impossibile trovare l'action del form di login.");
    const actionUrl = actionMatch[1].replace(/&amp;/g, '&');
    const formData = new URLSearchParams({ username, password, rememberMe: 'on' });
    const r3 = await fetch(actionUrl, { method: 'POST', headers: { ...Object.fromEntries(sessionHeaders.entries()), 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData.toString(), redirect: 'manual' });
    if (r3.headers.has('set-cookie')) sessionHeaders.append('cookie', r3.headers.get('set-cookie'));
    const finalUrl = r3.headers.get('location');
    await fetch(finalUrl, { headers: sessionHeaders });
    console.log("✅ Login ZwiftPower completato.");
    return sessionHeaders;
}

async function safeRequest(url, sessionHeaders) {
    const resp = await fetch(url, { headers: sessionHeaders, timeout: 20000 }); // 20 sec timeout
    if (!resp.ok) throw new Error(`Richiesta a ${url} fallita con status ${resp.status}`);
    return resp;
}

async function scrapeEventDetails(eventId, sessionHeaders) {
    console.log("[+] Analizzo l'HTML dell'evento...");
    const url = `https://zwiftpower.com/events.php?zid=${eventId}`;
    const details = { eventName: `Gara ${eventId}`, eventDate: new Date().toISOString().split('T')[0], route: '', distance: '', elevation: '', laps: '', description: '' };
    try {
        const resp = await safeRequest(url, sessionHeaders);
        const text = await resp.text();
        // Simplified parsing for brevity, real implementation would use a proper HTML parser if available
        const titleMatch = text.match(/<h3 class='text-center'>(.*?)<\/h3>/);
        if (titleMatch) details.eventName = titleMatch[1].trim();

        const dateMatch = text.match(/<span id='EVENT_DATE'>(.*?)<\/span>/);
        if (dateMatch) details.eventDate = new Date(dateMatch[1].trim()).toISOString().split('T')[0];

        // Simplified extraction for route/distance/elevation/laps/description - needs more robust parsing
        const routeMatch = text.match(/Route:\s*(.*?)(<br\s*\/?>|\n)/i);
        if(routeMatch && routeMatch[1]) details.route = routeMatch[1].trim();

        const distanceMatch = text.match(/Distance:\s*([\d.]+)\s*km/i);
        if(distanceMatch && distanceMatch[1]) details.distance = `${distanceMatch[1]} km`;

        const elevationMatch = text.match(/Elevation Gain:\s*([\d.]+)\s*m/i);
        if(elevationMatch && elevationMatch[1]) details.elevation = `${elevationMatch[1]} m`;
        
const lapsMatch = text.match(/<i class=['"]fa fa-retweet['"]><\/i>\s*(\d+)/);
if (lapsMatch && lapsMatch[1]) details.laps = lapsMatch[1].trim();

const descriptionMatch = text.match(/<p class=['"]event_info['"]>(.*?)<\/p>/s);
if(descriptionMatch && descriptionMatch[1]) details.description = descriptionMatch[1].trim();


    } catch (e) {
        console.error("Errore nello scraping dei dettagli evento:", e.message);
    }
    return details;
}

async function downloadEventJsons(eventId, sessionHeaders) {
    const urls = {
        fin: `https://zwiftpower.com/cache3/results/${eventId}_view.json`
    };
    for (const cat of ["A", "B", "C", "D", "E"]) {
        urls[`fal_${cat}`] = `https://zwiftpower.com/api3.php?do=event_primes&zid=${eventId}&category=${cat}&prime_type=msec`;
        urls[`fts_${cat}`] = `https://zwiftpower.com/api3.php?do=event_primes&zid=${eventId}&category=${cat}&prime_type=elapsed`;
    }
    const fetchedData = {};
    for (const key in urls) {
        try {
            const resp = await safeRequest(urls[key], sessionHeaders);
            fetchedData[key] = await resp.json();
        } catch (e) {
            fetchedData[key] = null;
        }
    }
    return fetchedData;
}

// --- Updated Calculation Logic (from MWT_Ranking/index.html) ---

const PUNTI_FIN = [100,80,70,60,55,50,45,40,36,32,29,26,24,22,20,18,16,14,12,10];
const PUNTI_FTS = [25,21,17,14,11,8,6,4,2,1];
const PUNTI_FAL = [25,21,17,14,11,8,6,4,2,1];
const CATEGORIE = ['A','B','C','D','E'];

function estraiRidersPerCategoria(sprintData, targetCategory) {
    const ridersByCategory = {[targetCategory]: []};
    if (!sprintData || !sprintData.data) return ridersByCategory;
    sprintData.data.forEach(sprint => {
        const uniqueSprintId = sprint.name + (sprint.lap ? ` (Lap ${sprint.lap})` : '');
        Object.keys(sprint).forEach(key => {
            if(key.startsWith('rider_')) {
                const rider = sprint[key];
                ridersByCategory[targetCategory].push({
                    zwid: rider.zwid, name: rider.name, elapsed: rider.elapsed, mtime: rider.mtime, msec: rider.msec,     
                    sprint_name: sprint.name, lap: sprint.lap, unique_sprint_id: uniqueSprintId
                });
            }
        });
    });
    return ridersByCategory;
}

function calcolaClassificaSprint(ridersByCategory, mode, targetCategory, selectedSegments) {
    const risultati = {[targetCategory]: {}};
    const riders = ridersByCategory[targetCategory];
    if(!riders || riders.length === 0) return risultati;
    const sprintGroups = {};
    riders.forEach(r => {
        if(!sprintGroups[r.unique_sprint_id]) sprintGroups[r.unique_sprint_id] = [];
        sprintGroups[r.unique_sprint_id].push(r);
    });
    
    Object.values(sprintGroups).forEach(sprintRiders => {
        const segmentName = sprintRiders[0].unique_sprint_id; 
        const segmentClassifications = selectedSegments[segmentName] || { SPRINT: false, KOM: false, FAL: false, FTS: false };

        if(mode === 'FAL') sprintRiders.sort((a, b) => a.msec - b.msec);
        else sprintRiders.sort((a, b) => a.elapsed - b.elapsed);
        
        const puntiDaUsare = (mode === 'FAL') ? PUNTI_FAL : PUNTI_FTS;

        sprintRiders.forEach((rider, pos) => {
            if(!risultati[targetCategory][rider.zwid]) {
                risultati[targetCategory][rider.zwid] = { name: rider.name, fal_points: 0, fts_points: 0, sprint_points: 0, kom_points: 0 };
            }
            if(pos < puntiDaUsare.length) {
                const points = puntiDaUsare[pos];
                if(mode === 'FAL') {
                    if (segmentClassifications.FAL) risultati[targetCategory][rider.zwid].fal_points += points;
                    if (segmentClassifications.SPRINT && segmentClassifications.FAL) risultati[targetCategory][rider.zwid].sprint_points += points;
                    if (segmentClassifications.KOM && segmentClassifications.FAL) risultati[targetCategory][rider.zwid].kom_points += points;
                } else {
                    if (segmentClassifications.FTS) risultati[targetCategory][rider.zwid].fts_points += points;
                    if (segmentClassifications.SPRINT && segmentClassifications.FTS) risultati[targetCategory][rider.zwid].sprint_points += points;
                    if (segmentClassifications.KOM && segmentClassifications.FTS) risultati[targetCategory][rider.zwid].kom_points += points;
                }
            }
        });
    });
    return risultati;
}

function calcolaClassificaGaraSingola(primeData, finData, selectedSegments){
    const classGara = {};
    const finRecords = finData ? (Array.isArray(finData.data) ? finData.data : finData) : [];

    CATEGORIE.forEach(cat => {
        const punteggio = {};
        const catFinishers = finRecords.filter(f => f.category === cat); 
        catFinishers.sort((a, b) => (parseFloat(a.time_gun || 0)) - (parseFloat(b.time_gun || 0)));

        catFinishers.forEach((f, index) => {
            const rzwid = parseInt(f.zwid);
            const pFin = (index < PUNTI_FIN.length) ? PUNTI_FIN[index] : 0;
            const raceTime = parseFloat(f.time_gun || 0) || 0;
            punteggio[rzwid] = { zwid: rzwid, name: f.name, tname: f.tname, flag: f.flag, time: raceTime, fin: pFin, fal: 0, fts: 0, pts_sprint: 0, pts_kom: 0 };
        });

        const falResults = calcolaClassificaSprint(estraiRidersPerCategoria(primeData[`fal_${cat}`], cat), 'FAL', cat, selectedSegments);
        const ftsResults = calcolaClassificaSprint(estraiRidersPerCategoria(primeData[`fts_${cat}`], cat), 'FTS', cat, selectedSegments);
        const allRiders = new Set([...Object.keys(falResults[cat] || {}), ...Object.keys(ftsResults[cat] || {})]);

        allRiders.forEach(zwid => {
            const currentZwid = parseInt(zwid);
            const falData = falResults[cat] ? falResults[cat][zwid] : null;
            const ftsData = ftsResults[cat] ? ftsResults[cat][zwid] : null;

            if (!punteggio[currentZwid]) {
                const riderName = (falData || ftsData)?.name || "Unknown"; // Fallback to avoid error
                punteggio[currentZwid] = { zwid: currentZwid, name: riderName, tname: '', flag: '', time: 0, fin: 0, fal: 0, fts: 0, pts_sprint: 0, pts_kom: 0 };
            }
            
            if (falData) {
                punteggio[currentZwid].fal += falData.fal_points;
                punteggio[currentZwid].pts_sprint += falData.sprint_points;
                punteggio[currentZwid].pts_kom += falData.kom_points;
            }
            if (ftsData) {
                punteggio[currentZwid].fts += ftsData.fts_points;
                punteggio[currentZwid].pts_sprint += ftsData.sprint_sprint;
                punteggio[currentZwid].pts_kom += ftsData.kom_points;
            }
        });

        const riders = Object.values(punteggio).map(r => ({...r, total: r.fal + r.fts + r.fin}));
        classGara[cat] = riders;
    });
    return classGara;
}

// --- Main calculation and cumulative update function ---
async function calculateAndStoreRankings(env, raceId, eventId, fetchedData, selectedSegments) {
    const { fin, ...primeData } = fetchedData;
    
    // --- 0. Calculate current race max times for DNF penalties ---
    const currentRaceMaxTimes = {};
    for (const cat of CATEGORIE) {
        const catFinishers = (fin && fin.data) ? fin.data.filter(f => f.category === cat && parseFloat(f.time_gun || 0) > 0) : [];
        currentRaceMaxTimes[cat] = catFinishers.length > 0 ? Math.max(...catFinishers.map(f => parseFloat(f.time_gun || 0))) : 0;
    }

    // --- 1. Calculate Single Race Results ---
    const classGaraSingola = calcolaClassificaGaraSingola(primeData, fin, selectedSegments);
    
    // --- 2. Update Database for Race, Riders, and Race Results ---
    const eventDetails = await scrapeEventDetails(eventId, new Headers());
    
    const batchOps = [];

    // Insert/Update Race
    batchOps.push(env.ZRL_DB.prepare(
        "INSERT INTO races (id, zwift_event_id, name, event_date, status, max_times_json) VALUES (?, ?, ?, ?, ?, ?) " +
        "ON CONFLICT(id) DO UPDATE SET zwift_event_id=excluded.zwift_event_id, name=excluded.name, event_date=excluded.event_date, status=excluded.status, max_times_json=excluded.max_times_json"
    ).bind(raceId, eventId, eventDetails.eventName, eventDetails.eventDate, 'published', JSON.stringify(currentRaceMaxTimes)));

    for (const cat of CATEGORIE) {
        if (!classGaraSingola[cat]) continue;
        for (const [index, rider] of classGaraSingola[cat].entries()) {
            // Insert/Update Rider
            batchOps.push(env.ZRL_DB.prepare(
                "INSERT INTO riders (zwid, name, flag) VALUES (?, ?, ?) ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, flag=excluded.flag"
            ).bind(rider.zwid, rider.name, rider.flag || null));

            // Insert/Update Race Results
            batchOps.push(env.ZRL_DB.prepare(
                "INSERT INTO race_results (race_id, rider_zwid, category, team_name, position, race_time_ms, points_fin, points_fal, points_fts, points_sprint, points_kom, points_total) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(race_id, rider_zwid) DO UPDATE SET " +
                "category=excluded.category, team_name=excluded.team_name, position=excluded.position, race_time_ms=excluded.race_time_ms, points_fin=excluded.points_fin, points_fal=excluded.points_fal, " +
                "points_fts=excluded.points_fts, points_sprint=excluded.points_sprint, points_kom=excluded.points_kom, points_total=excluded.points_total"
            ).bind(
                raceId, rider.zwid, cat, rider.tname || null, index + 1, Math.round(rider.time * 1000), // Convert to ms
                rider.fin, rider.fal, rider.fts, rider.pts_sprint, rider.pts_kom, rider.total
            ));
        }
    }
    
    await env.ZRL_DB.batch(batchOps);
    console.log(`✅ Dati di gara singola per ${eventId} (Gara ${raceId}) salvati.`);

    // --- 4. Recalculate and Update Cumulative Standings from scratch ---
    console.log("Recalcolando classifiche cumulative...");
    const allRaces = await env.ZRL_DB.prepare("SELECT id, max_times_json FROM races WHERE status = 'published' ORDER BY id ASC").all();
    const cumulativeMaxTimesPerRace = allRaces.results.map(r => JSON.parse(r.max_times_json));
    
    let cumulativeResults = {}; // { cat: { zwid: { ... } } } 

    for (let i = 0; i < allRaces.results.length; i++) {
        const currentRaceForLoop = allRaces.results[i];
        const currentRaceId = currentRaceForLoop.id;
        const currentRaceMaxTimesForPenalties = cumulativeMaxTimesPerRace[i];

        const raceResultsForCumulative = await env.ZRL_DB.prepare(
            `SELECT rr.rider_zwid, rr.category, rr.team_name, rr.points_total, rr.race_time_ms, rr.points_sprint, rr.points_kom, r.name, r.flag FROM race_results rr JOIN riders r ON rr.rider_zwid = r.zwid WHERE rr.race_id = ?`
        ).bind(currentRaceId).all();

        const ridersInThisRace = new Set(raceResultsForCumulative.results.map(rr => rr.rider_zwid));

        for (const cat of CATEGORIE) {
            const timeForDNF = (currentRaceMaxTimesForPenalties[cat] || 0) * 1000;

            // Apply DNF penalties to riders who exist in cumulative but missed this race
            for (const riderZwid in cumulativeResults[cat]) {
                if (!ridersInThisRace.has(parseInt(riderZwid))) {
                    cumulativeResults[cat][riderZwid].total_time_ms += timeForDNF;
                    cumulativeResults[cat][riderZwid].races_completed += 1;
                }
            }

            // Add points for riders in the current race
            raceResultsForCumulative.results.filter(rr => rr.category === cat).forEach(rr => {
                const timeToApply = (rr.race_time_ms > 0) ? rr.race_time_ms : timeForDNF;

                if (!cumulativeResults[cat]) cumulativeResults[cat] = {};
                if (!cumulativeResults[cat][rr.rider_zwid]) {
                    // New rider for this category, apply penalties for all past races
                    let penaltyTime = 0;
                    for (let j = 0; j < i; j++) {
                        penaltyTime += (cumulativeMaxTimesPerRace[j][cat] || 0) * 1000;
                    }
                    cumulativeResults[cat][rr.rider_zwid] = {
                        zwid: rr.rider_zwid, name: rr.name, flag: rr.flag, tname: rr.team_name,
                        total_points: 0, total_time_ms: penaltyTime, total_sprint_points: 0, total_kom_points: 0,
                        races_completed: i
                    };
                }
                const cum = cumulativeResults[cat][rr.rider_zwid];
                cum.total_points += rr.points_total;
                cum.total_time_ms += timeToApply;
                cum.total_sprint_points += rr.points_sprint;
                cum.total_kom_points += rr.points_kom;
                cum.races_completed += 1;
            });
        }
    }

    // --- Store Cumulative Standings ---
    const cumulativeBatchOps = [env.ZRL_DB.prepare("DELETE FROM championship_standings")]; // Clear table before recalculating
    for (const cat of CATEGORIE) {
        for (const riderZwid in cumulativeResults[cat]) {
            const cum = cumulativeResults[cat][riderZwid];
            cumulativeBatchOps.push(env.ZRL_DB.prepare(
                "INSERT INTO championship_standings (rider_zwid, category, total_points, total_time_ms, total_sprint_points, total_kom_points, races_completed) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).bind(cum.zwid, cat, cum.total_points, cum.total_time_ms, cum.total_sprint_points, cum.total_kom_points, cum.races_completed));
        }
    }
    await env.ZRL_DB.batch(cumulativeBatchOps);

    console.log(`✅ Classifiche cumulative aggiornate.`);
}


// --- Main Request Handler ---

export async function onRequestPost({ request, env }) {
    try {
        const payload = await verifyToken(request, env);
        if (payload.role !== 'admin') throw new Error('Accesso negato.');

        const input = await request.json();
        const { race_id, zwift_event_id, download_only, calculate_only, segment_mapping } = input;

        if (!race_id || !zwift_event_id) throw new Error('race_id e zwift_event_id sono entrambi richiesti.');
        if (!env.ZRL_DB || !env.JWT_SECRET || !env.ENCRYPTION_KEY) throw new Error('Errore di configurazione del server (DB/Secrets).');

        const { results: userCreds } = await env.ZRL_DB.prepare("SELECT zwift_username, zwift_password_encrypted FROM users WHERE id = ?").bind(payload.userId).all();
        if (!userCreds[0]?.zwift_password_encrypted) throw new Error('Credenziali ZwiftPower non impostate nel profilo.');
        
        const decryptedPassword = await decrypt(userCreds[0].zwift_password_encrypted, env.ENCRYPTION_KEY);
        const sessionHeaders = await loginToZwiftPower(env, userCreds[0].zwift_username, decryptedPassword);

        let fetchedData;
        
        // Always download data for now
        fetchedData = await downloadEventJsons(zwift_event_id, sessionHeaders);
        if (!fetchedData) throw new Error("Impossibile scaricare i dati per il calcolo delle classifiche.");
        
        if (download_only) {
            return new Response(JSON.stringify({
                message: `Dati raw per evento ${zwift_event_id} scaricati.`, 
                raw_data: {
                    fal: Object.keys(fetchedData).filter(k => k.startsWith('fal_')).reduce((obj, key) => { obj[key.slice(4)] = fetchedData[key]; return obj; }, {}),
                    fts: Object.keys(fetchedData).filter(k => k.startsWith('fts_')).reduce((obj, key) => { obj[key.slice(4)] = fetchedData[key]; return obj; }, {}),
                }
            }), { status: 200 });
        }

        await calculateAndStoreRankings(env, race_id, zwift_event_id, fetchedData, segment_mapping || {});
        return new Response(JSON.stringify({ message: `Classifiche per evento ${zwift_event_id} (Gara ${race_id}) aggiornate.` }), { status: 200 });

    } catch (error) {
        console.error("Errore nel worker di importazione:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: error.message.includes('Token') || error.message.includes('Accesso negato') || error.message.includes('Credenziali ZwiftPower non impostate') ? 403 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
