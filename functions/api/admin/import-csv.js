
export async function onRequestPost(context) {
  const { request, env, data } = context;
  if (data.user?.role !== 'admin') return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

  try {
    const csvContent = await request.text();
    
    // Parser CSV Robusto
    const parseCSV = (text) => {
      const rows = [];
      let currentRow = [];
      let currentField = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { currentRow.push(currentField.trim()); currentField = ''; }
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
      if (currentRow.length > 0) rows.push(currentRow);
      return rows;
    };

    const allRows = parseCSV(csvContent);
    const header = allRows[0];
    
    // Orari forniti dall'utente
    const validTimes = ["06:00", "07:00", "07:30", "09:30", "10:30", "11:30", "12:00", "13:00", "14:00", "18:00", "18:30", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45"];
    
    const timeSlotCols = [];
    header.forEach((col, index) => {
      const cleanCol = col.trim();
      if (validTimes.includes(cleanCol)) {
        timeSlotCols.push({ index, name: cleanCol });
      }
    });

    // 1. RECUPERO STATO DB ATTUALE
    const { results: dbAthletes } = await env.DB.prepare("SELECT zwid, email FROM athletes").all();
    const emailToZwidMap = new Map();
    dbAthletes.forEach(a => {
      if (a.email) emailToZwidMap.set(a.email.toLowerCase().trim(), a.zwid);
    });

    const athletesToProcess = [];
    const processedEmailsInCsv = new Map();
    let skippedMailConflicts = 0;

    // 2. FILTRAGGIO E PREPARAZIONE
    for (let i = 1; i < allRows.length; i++) {
      const row = allRows[i];
      if (row.length < 6) continue;

      const zwid = parseInt(row[5]);
      if (isNaN(zwid)) continue;

      const email = row[2]?.toLowerCase().trim() || null;

      // LOGICA RICHIESTA: Se la mail è già in uso da un ALTRO ZwiftID, scarta l'utente
      if (email) {
        const dbOwner = emailToZwidMap.get(email);
        const csvOwner = processedEmailsInCsv.get(email);

        if ((dbOwner !== undefined && dbOwner !== zwid) || (csvOwner !== undefined && csvOwner !== zwid)) {
          skippedMailConflicts++;
          continue; 
        }
        processedEmailsInCsv.set(email, zwid);
      }

      const prefs = [];
      timeSlotCols.forEach(slot => {
        const val = row[slot.index];
        let level = val === '💚' ? 2 : val === '💛' ? 1 : val === '⛔' ? 0 : null;
        if (level !== null) prefs.push({ slotId: slot.name, level });
      });

      athletesToProcess.push({
        zwid,
        name: row[0],
        category: row[1],
        email: email,
        team: row[3],
        preferences: prefs
      });
    }

    // 3. ESECUZIONE SQL (RESET & REPLACE)
    const statements = [];

    // Setup Slot e Team
    validTimes.forEach((t, idx) => statements.push(env.DB.prepare("INSERT OR IGNORE INTO league_times (id, region, start_time_utc, display_name, slot_order) VALUES (?, 'Europe', ?, ?, ?)").bind(t, t, `Slot ${t}`, idx)));

    athletesToProcess.forEach(a => {
      // Aggiorna profilo (ON CONFLICT zwid)
      statements.push(env.DB.prepare(`
        INSERT INTO athletes (zwid, name, email, team, base_category, role) 
        VALUES (?1, ?2, ?3, ?4, ?5, 'user')
        ON CONFLICT(zwid) DO UPDATE SET 
          name=excluded.name, email=excluded.email, team=excluded.team, base_category=excluded.base_category
      `).bind(a.zwid, a.name, a.email, a.team, a.category));

      // Reset Preferenze per questo Zwid
      statements.push(env.DB.prepare("DELETE FROM user_time_preferences WHERE zwid = ?").bind(a.zwid));
      a.preferences.forEach(p => {
        statements.push(env.DB.prepare("INSERT INTO user_time_preferences (zwid, time_slot_id, preference_level) VALUES (?, ?, ?)").bind(a.zwid, p.slotId, p.level));
      });

      if (a.team) statements.push(env.DB.prepare("INSERT OR IGNORE INTO teams (name) VALUES (?)").bind(a.team));
    });

    // 4. INVIO A CHUNK (30 alla volta)
    const CHUNK_SIZE = 30;
    for (let i = 0; i < statements.length; i += CHUNK_SIZE) {
      await env.DB.batch(statements.slice(i, i + CHUNK_SIZE));
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: athletesToProcess.length,
      skipped: skippedMailConflicts,
      message: `Aggiornamento completato. ${athletesToProcess.length} atleti processati, ${skippedMailConflicts} saltati per email duplicata.`
    }), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
