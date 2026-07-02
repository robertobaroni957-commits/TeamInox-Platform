// functions/api/admin/winter-tour/import.js

// --- ZwiftPower Scraper Helpers ---
async function loginToZwiftPower(username, password) {
  const sessionHeaders = new Headers({ 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36' 
  });
  
  console.log("🔐 Inizio login su ZwiftPower...");
  const r1 = await fetch("https://zwiftpower.com/ucp.php?mode=login&login=external&oauth_service=oauthzpsso", { 
    method: 'GET', 
    headers: sessionHeaders, 
    redirect: 'manual' 
  });
  
  let cookieHeader = "";
  if (r1.headers.has('set-cookie')) {
    cookieHeader = r1.headers.get('set-cookie');
    sessionHeaders.set('cookie', cookieHeader);
  }
  
  const loginPageUrl = r1.headers.get('location');
  if (!loginPageUrl) throw new Error("Impossibile procedere col login (riga 1).");

  const r2 = await fetch(loginPageUrl, { method: 'GET', headers: sessionHeaders, redirect: 'manual' });
  if (r2.headers.has('set-cookie')) {
    cookieHeader = cookieHeader ? `${cookieHeader}; ${r2.headers.get('set-cookie')}` : r2.headers.get('set-cookie');
    sessionHeaders.set('cookie', cookieHeader);
  }
  
  const body = await r2.text();
  const actionMatch = body.match(/<form[^>]+id="form"[^>]+action=\"([^\"]+)\"/);
  if (!actionMatch) throw new Error("Impossibile trovare l'action del form di login.");
  
  const actionUrl = actionMatch[1].replace(/&amp;/g, '&');
  const formData = new URLSearchParams({ username, password, rememberMe: 'on' });
  
  const r3 = await fetch(actionUrl, { 
    method: 'POST', 
    headers: { 
      ...Object.fromEntries(sessionHeaders.entries()), 
      'Content-Type': 'application/x-www-form-urlencoded' 
    }, 
    body: formData.toString(), 
    redirect: 'manual' 
  });
  
  if (r3.headers.has('set-cookie')) {
    cookieHeader = `${cookieHeader}; ${r3.headers.get('set-cookie')}`;
    sessionHeaders.set('cookie', cookieHeader);
  }
  
  const finalUrl = r3.headers.get('location');
  if (!finalUrl) throw new Error("Login non riuscito (credenziali errate o captcha).");
  
  await fetch(finalUrl, { headers: sessionHeaders });
  console.log("✅ Login ZwiftPower completato.");
  return sessionHeaders;
}

async function safeRequest(url, sessionHeaders = null) {
  const options = sessionHeaders ? { headers: sessionHeaders } : {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://zwiftpower.com/'
    }
  };
  const resp = await fetch(url, options);
  if (!resp.ok) throw new Error(`Richiesta fallita con status ${resp.status} per ${url}`);
  return resp;
}

async function downloadEventJsons(eventId, sessionHeaders = null) {
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
      console.error(`Errore caricamento ${key}:`, e.message);
      fetchedData[key] = null;
    }
  }
  return fetchedData;
}

// --- Parsing and points calculations ---
function estraiRidersPerCategoria(sprintData, targetCategory) {
  const ridersByCategory = { [targetCategory]: [] };
  if (!sprintData || !sprintData.data) return ridersByCategory;
  
  sprintData.data.forEach(sprint => {
    const uniqueSprintId = sprint.name + (sprint.lap ? ` (Lap ${sprint.lap})` : '');
    Object.keys(sprint).forEach(key => {
      if (key.startsWith('rider_')) {
        const rider = sprint[key];
        ridersByCategory[targetCategory].push({
          zwid: parseInt(rider.zwid), 
          name: rider.name, 
          elapsed: parseFloat(rider.elapsed || 0), 
          mtime: rider.mtime, 
          msec: parseInt(rider.msec || 0), 
          sprint_name: sprint.name, 
          lap: sprint.lap, 
          unique_sprint_id: uniqueSprintId
        });
      }
    });
  });
  return ridersByCategory;
}

function calcolaClassificaSprint(ridersByCategory, mode, targetCategory, selectedSegments, puntiFAL, puntiFTS) {
  const risultati = { [targetCategory]: {} };
  const riders = ridersByCategory[targetCategory];
  if (!riders || riders.length === 0) return risultati;
  
  const sprintGroups = {};
  riders.forEach(r => {
    if (!sprintGroups[r.unique_sprint_id]) sprintGroups[r.unique_sprint_id] = [];
    sprintGroups[r.unique_sprint_id].push(r);
  });
  
  Object.values(sprintGroups).forEach(sprintRiders => {
    const segmentName = sprintRiders[0].unique_sprint_id; 
    const segmentClassifications = selectedSegments[segmentName] || { SPRINT: false, KOM: false, FAL: false, FTS: false };

    if (mode === 'FAL') sprintRiders.sort((a, b) => a.msec - b.msec);
    else sprintRiders.sort((a, b) => a.elapsed - b.elapsed);
    
    const puntiDaUsare = (mode === 'FAL') ? puntiFAL : puntiFTS;

    sprintRiders.forEach((rider, pos) => {
      if (!risultati[targetCategory][rider.zwid]) {
        risultati[targetCategory][rider.zwid] = { 
          name: rider.name, 
          fal_points: 0, 
          fts_points: 0, 
          sprint_points: 0, 
          kom_points: 0 
        };
      }
      
      if (pos < puntiDaUsare.length) {
        const points = puntiDaUsare[pos];
        if (mode === 'FAL') {
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

function calcolaClassificaGaraSingola(primeData, finData, selectedSegments, puntiFIN, puntiFAL, puntiFTS) {
  const classGara = {};
  const finRecords = finData ? (Array.isArray(finData.data) ? finData.data : finData) : [];

  const CATEGORIE = ['A', 'B', 'C', 'D', 'E'];

  CATEGORIE.forEach(cat => {
    const punteggio = {};
    const catFinishers = finRecords.filter(f => f.category === cat); 
    catFinishers.sort((a, b) => parseFloat(a.time_gun || 0) - parseFloat(b.time_gun || 0));

    catFinishers.forEach((f, index) => {
      const rzwid = parseInt(f.zwid);
      const pFin = (index < puntiFIN.length) ? puntiFIN[index] : 0;
      const raceTime = parseFloat(f.time_gun || 0) || 0;
      punteggio[rzwid] = { 
        zwid: rzwid, 
        name: f.name, 
        tname: f.tname || "", 
        flag: f.flag || "", 
        time: raceTime, 
        fin: pFin, 
        fal: 0, 
        fts: 0, 
        pts_sprint: 0, 
        pts_kom: 0 
      };
    });

    const falResults = calcolaClassificaSprint(estraiRidersPerCategoria(primeData[`fal_${cat}`], cat), 'FAL', cat, selectedSegments, puntiFAL, puntiFTS);
    const ftsResults = calcolaClassificaSprint(estraiRidersPerCategoria(primeData[`fts_${cat}`], cat), 'FTS', cat, selectedSegments, puntiFAL, puntiFTS);
    const allRiders = new Set([...Object.keys(falResults[cat] || {}), ...Object.keys(ftsResults[cat] || {})]);

    allRiders.forEach(zwid => {
      const currentZwid = parseInt(zwid);
      const falData = falResults[cat] ? falResults[cat][zwid] : null;
      const ftsData = ftsResults[cat] ? ftsResults[cat][zwid] : null;

      if (!punteggio[currentZwid]) {
        const riderName = (falData || ftsData)?.name || "Unknown Rider";
        punteggio[currentZwid] = { 
          zwid: currentZwid, 
          name: riderName, 
          tname: '', 
          flag: '', 
          time: 0, 
          fin: 0, 
          fal: 0, 
          fts: 0, 
          pts_sprint: 0, 
          pts_kom: 0 
        };
      }
      
      if (falData) {
        punteggio[currentZwid].fal += falData.fal_points;
        punteggio[currentZwid].pts_sprint += falData.sprint_points;
        punteggio[currentZwid].pts_kom += falData.kom_points;
      }
      if (ftsData) {
        punteggio[currentZwid].fts += ftsData.fts_points;
        punteggio[currentZwid].pts_sprint += ftsData.sprint_points;
        punteggio[currentZwid].pts_kom += ftsData.kom_points;
      }
    });

    const riders = Object.values(punteggio).map(r => ({
      ...r, 
      total: r.fal + r.fts + r.fin
    }));
    
    // Sort riders by total points (descending) and time (ascending, if time > 0)
    riders.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      const aTime = a.time > 0 ? a.time : Infinity;
      const bTime = b.time > 0 ? b.time : Infinity;
      return aTime - bTime;
    });

    classGara[cat] = riders;
  });
  
  return classGara;
}

// --- Request Handler ---
export async function onRequestPost(context) {
  const { request, env, data } = context;

  // 1. Authorize User
  const user = data?.user;
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return new Response(JSON.stringify({ error: "Forbidden: Unauthorized access" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const input = await request.json();
    const { 
      stage_id, zwift_event_id, 
      download_only, calculate_only,
      zwift_username, zwift_password,
      manual_fin_data, manual_primes_data,
      segment_mapping, publish
    } = input;

    if (!stage_id) {
      return new Response(JSON.stringify({ error: "stage_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const wtDb = env.WINTER_TOUR_DB;

    // Load stage details
    const stage = await wtDb.prepare("SELECT * FROM wt_stages WHERE id = ?").bind(parseInt(stage_id)).first();
    if (!stage) {
      return new Response(JSON.stringify({ error: `Stage ${stage_id} not found` }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const eventId = zwift_event_id || stage.zwift_event_id;

    // 2. Fetch or Use Manual Data
    let fetchedData = null;

    if (manual_fin_data) {
      // Use manually pasted data
      fetchedData = {
        fin: manual_fin_data,
        ...(manual_primes_data || {})
      };
      
      // Ensure all prime fields are initialized
      for (const cat of ["A", "B", "C", "D", "E"]) {
        if (!fetchedData[`fal_${cat}`]) fetchedData[`fal_${cat}`] = { data: [] };
        if (!fetchedData[`fts_${cat}`]) fetchedData[`fts_${cat}`] = { data: [] };
      }
    } else if (zwift_username && zwift_password) {
      // Run authenticated scraper
      const sessionHeaders = await loginToZwiftPower(zwift_username, zwift_password);
      fetchedData = await downloadEventJsons(eventId, sessionHeaders);
    } else {
      // Anonymous fetch — try ZwiftPower public endpoints directly using zwift_event_id
      console.log(`🌐 Fetch anonimo da ZwiftPower per event_id=${eventId}...`);
      fetchedData = await downloadEventJsons(eventId, null);

      if (!fetchedData || !fetchedData.fin) {
        return new Response(JSON.stringify({ 
          error: `Impossibile recuperare i dati da ZwiftPower per l'evento ${eventId}. Verifica che i risultati siano pubblicati su ZwiftPower oppure inserisci le credenziali ZP.`
        }), {
          status: 422,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    if (!fetchedData || !fetchedData.fin) {
      return new Response(JSON.stringify({ error: "Failed to load/parse Finish results data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Extract all unique segment names from prime JSONs
    const uniqueSegments = new Set();
    const categories = ["A", "B", "C", "D", "E"];
    categories.forEach(cat => {
      ['fal', 'fts'].forEach(prefix => {
        const key = `${prefix}_${cat}`;
        const primes = fetchedData[key];
        if (primes && Array.isArray(primes.data)) {
          primes.data.forEach(sprint => {
            const uniqueSprintId = sprint.name + (sprint.lap ? ` (Lap ${sprint.lap})` : '');
            uniqueSegments.add(uniqueSprintId);
          });
        }
      });
    });

    const segmentsList = Array.from(uniqueSegments).sort();

    // If download_only, we just stop here and return segments and raw data
    if (download_only) {
      return new Response(JSON.stringify({
        success: true,
        segments: segmentsList,
        fetchedData: fetchedData
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 4. Fetch scoring rules from database to apply them dynamically
    const { results: rawRules } = await wtDb.prepare("SELECT * FROM wt_scoring_rules").all();
    
    // Convert rules into arrays indexable by position-1
    const rulesMap = { FIN: [], FAL: [], FTS: [] };
    rawRules.forEach(rule => {
      rulesMap[rule.type][rule.position - 1] = rule.points;
    });

    // 5. Calculate Classifications
    const mapping = segment_mapping || {};
    const singleRaceResults = calcolaClassificaGaraSingola(
      fetchedData, 
      fetchedData.fin, 
      mapping,
      rulesMap.FIN, 
      rulesMap.FAL, 
      rulesMap.FTS
    );

    // If calculate_only, we return the calculated preview standings but don't write to DB
    if (calculate_only) {
      return new Response(JSON.stringify({
        success: true,
        preview_results: singleRaceResults
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 6. Save and publish results
    if (publish) {
      const batchOps = [];

      // Remove any existing results for this stage
      batchOps.push(wtDb.prepare("DELETE FROM wt_results WHERE stage_id = ?").bind(parseInt(stage_id)));

      // Save each category results
      categories.forEach(cat => {
        const catResults = singleRaceResults[cat] || [];
        
        // Find max time of category for positions calculation
        const times = catResults.map(r => r.time).filter(t => t > 0);
        const maxTime = times.length > 0 ? Math.max(...times) : 0;

        // Sort finishers by time ascending to get true tempo positions
        const finishers = catResults
          .filter(r => r.time > 0)
          .sort((a, b) => a.time - b.time || b.total - a.total);
        
        const tempoPosMap = new Map();
        finishers.forEach((r, idx) => {
          tempoPosMap.set(r.zwid, idx + 1);
        });

        catResults.forEach((r, index) => {
          const pointsPosition = index + 1;
          const tempoPosition = r.time > 0 ? tempoPosMap.get(r.zwid) : null;
          
          batchOps.push(wtDb.prepare(`
            INSERT INTO wt_results (
              stage_id, category, name, tname, zwid, flag,
              punti_pos, punti_fin, punti_fal, punti_fts, punti_total,
              tempo_time, tempo_pos, sprinter_points, climber_points
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            parseInt(stage_id), cat, r.name, r.tname || null, r.zwid, r.flag || null,
            pointsPosition, r.fin, r.fal, r.fts, r.total,
            r.time, tempoPosition, r.pts_sprint, r.pts_kom
          ));
        });
      });

      // Update stage status to 'published' and store mapped segments
      batchOps.push(wtDb.prepare(
        "UPDATE wt_stages SET status = 'published' WHERE id = ?"
      ).bind(parseInt(stage_id)));

      if (batchOps.length > 0) {
        await wtDb.batch(batchOps);
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Results for stage ${stage_id} imported and published successfully.`
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action parameters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Errore importazione Worker:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
