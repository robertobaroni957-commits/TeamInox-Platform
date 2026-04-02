
export async function onRequestPost(context) {
  const { request, env, data } = context;
  
  // Verifica ruolo admin/moderator
  if (data.user?.role !== 'admin' && data.user?.role !== 'moderator') {
    return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), { status: 403 });
  }

  try {
    const rawContent = await request.text();
    if (!rawContent || rawContent.trim().length === 0) {
        return new Response(JSON.stringify({ error: "Contenuto vuoto o non valido" }), { status: 400 });
    }

    let athletesToProcess = [];
    const validTimes = ["06:00", "07:00", "07:30", "09:30", "10:30", "11:30", "12:00", "13:00", "14:00", "18:00", "18:30", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45"];

    // --- LOGICA PARSING JSON ---
    if (rawContent.trim().startsWith('[') || rawContent.trim().startsWith('{')) {
        console.log("DEBUG IMPORT: Rilevato formato JSON");
        let jsonData;
        try {
            let normalizedContent = rawContent.trim();
            // Se il JSON non inizia con [ ma sembra una lista di oggetti separati da virgola, lo avvolgiamo
            if (!normalizedContent.startsWith('[') && normalizedContent.startsWith('{')) {
                normalizedContent = '[' + normalizedContent + ']';
            }
            jsonData = JSON.parse(normalizedContent);
        } catch (e) {
            return new Response(JSON.stringify({ error: "Errore nel parsing del JSON: " + e.message }), { status: 400 });
        }

        const rows = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        // Identifica l'oggetto header (quello che ha "Rider Name" in "A" o simili)
        const headerObj = rows.find(r => r && (r.A === "Rider Name" || r.F === "ZwiftID"));
        
        if (!headerObj) {
            return new Response(JSON.stringify({ error: "Struttura JSON non riconosciuta (mancano intestazioni A/F)" }), { status: 400 });
        }

        // Mappa le chiavi JSON agli orari
        const timeKeyMap = [];
        Object.keys(headerObj).forEach(key => {
            const val = headerObj[key];
            if (typeof val === 'string' && validTimes.includes(val.trim())) {
                timeKeyMap.push({ key, time: val.trim() });
            }
        });

        rows.forEach(row => {
            if (!row || row === headerObj || !row.F) return; // Salta null, header o righe senza ZwiftID
            
            const zwid = parseInt(row.F);
            if (isNaN(zwid)) return;

            const prefs = [];
            timeKeyMap.forEach(slot => {
                const val = row[slot.key];
                let level = (val === '💚' || val === 2 || val === "2") ? 2 : 
                            (val === '💛' || val === 1 || val === "1") ? 1 : 
                            (val === '⛔' || val === 0 || val === "0") ? 0 : null;
                if (level !== null) prefs.push({ slotId: slot.time, level });
            });

            athletesToProcess.push({
                zwid,
                name: row.A || 'Unknown',
                category: row.B || 'N/A',
                email: row.C || null,
                team: row.D || null, // Usiamo colonna D come team se presente
                preferences: prefs
            });
        });
    } 
    // --- LOGICA PARSING CSV (SMART) ---
    else {
        console.log("DEBUG IMPORT: Rilevato formato CSV");
        const firstLine = rawContent.split('\n')[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';
        
        const parseCSV = (text, sep) => {
          const rows = [];
          let currentRow = [];
          let currentField = '';
          let inQuotes = false;
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === sep && !inQuotes) { currentRow.push(currentField.trim()); currentField = ''; }
            else if ((char === '\n' || char === '\r') && !inQuotes) {
              if (currentRow.length > 0 || currentField !== '') {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
              }
              if (char === '\r' && text[i+1] === '\n') i++;
            } else currentField += char;
          }
          if (currentRow.length > 0) { currentRow.push(currentField.trim()); rows.push(currentRow); }
          return rows;
        };

        const allRows = parseCSV(rawContent, delimiter);
        let headerIndex = -1;
        for (let i = 0; i < Math.min(allRows.length, 5); i++) {
            if (allRows[i].some(cell => cell.toLowerCase().includes('zwiftid'))) {
                headerIndex = i;
                break;
            }
        }
        
        if (headerIndex === -1) return new Response(JSON.stringify({ error: "Intestazione 'ZwiftID' non trovata nel CSV" }), { status: 400 });

        const header = allRows[headerIndex];
        const colMap = {
            name: header.findIndex(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('rider')),
            category: header.findIndex(c => c.toLowerCase().includes('ce') || c.toLowerCase().includes('cat')),
            email: header.findIndex(c => c.toLowerCase().includes('mail')),
            zwid: header.findIndex(c => c.toLowerCase().includes('zwiftid')),
            team: header.findIndex(c => c.toLowerCase().includes('team'))
        };

        const timeSlotCols = [];
        header.forEach((col, index) => {
          if (validTimes.includes(col.trim())) timeSlotCols.push({ index, name: col.trim() });
        });

        for (let i = headerIndex + 1; i < allRows.length; i++) {
          const row = allRows[i];
          if (row.length < 2) continue;
          const zwid = parseInt(row[colMap.zwid]);
          if (isNaN(zwid)) continue;

          const prefs = [];
          timeSlotCols.forEach(slot => {
            const val = row[slot.index];
            let level = (val === '💚' || val?.toLowerCase() === 'si') ? 2 : 
                        (val === '💛' || val?.toLowerCase() === 'forse') ? 1 : 
                        (val === '⛔' || val?.toLowerCase() === 'no') ? 0 : null;
            if (level !== null) prefs.push({ slotId: slot.name, level });
          });

          athletesToProcess.push({
            zwid,
            name: row[colMap.name] || 'Unknown',
            category: row[colMap.category] || 'N/A',
            email: colMap.email !== -1 ? (row[colMap.email] || null) : null,
            team: colMap.team !== -1 ? (row[colMap.team] || null) : null,
            preferences: prefs
          });
        }
    }

    console.log(`DEBUG IMPORT: Trovati ${athletesToProcess.length} atleti da processare.`);

    // --- ESECUZIONE AGGIORNAMENTO DATABASE ---
    const statements = [];

    // 1. Assicurati che gli slot orari esistano
    validTimes.forEach((t, idx) => {
        statements.push(env.DB.prepare("INSERT OR IGNORE INTO league_times (id, region, start_time_utc, display_name, slot_order) VALUES (?, 'Europe', ?, ?, ?)").bind(t, t, `Slot ${t}`, idx));
    });

    // 2. Processa ogni atleta
    for (const a of athletesToProcess) {
      // Upsert Atleta
      statements.push(env.DB.prepare(`
        INSERT INTO athletes (zwid, name, email, team, base_category, role) 
        VALUES (?1, ?2, ?3, ?4, ?5, 'user')
        ON CONFLICT(zwid) DO UPDATE SET 
          name=excluded.name, email=excluded.email, team=excluded.team, base_category=excluded.base_category
      `).bind(a.zwid, a.name, a.email, a.team, a.category));

      // Reset Preferenze
      statements.push(env.DB.prepare("DELETE FROM user_time_preferences WHERE zwid = ?").bind(a.zwid));
      
      // Inserisci nuove preferenze
      for (const p of a.preferences) {
        statements.push(env.DB.prepare("INSERT INTO user_time_preferences (zwid, time_slot_id, preference_level) VALUES (?, ?, ?)").bind(a.zwid, p.slotId, p.level));
      }
    }

    // Esecuzione a Batch (50 istruzioni alla volta)
    const CHUNK_SIZE = 50;
    for (let i = 0; i < statements.length; i += CHUNK_SIZE) {
      await env.DB.batch(statements.slice(i, i + CHUNK_SIZE));
    }

    return new Response(JSON.stringify({ 
      success: true, 
      athletesCount: athletesToProcess.length,
      teamsCount: [...new Set(athletesToProcess.map(a => a.team).filter(Boolean))].length,
      preferencesCount: athletesToProcess.reduce((acc, a) => acc + a.preferences.length, 0),
      message: `Importazione completata: ${athletesToProcess.length} atleti aggiornati.`
    }), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    console.error("IMPORT ERROR:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
