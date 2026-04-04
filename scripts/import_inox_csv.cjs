const fs = require('fs');

const csvPath = 'ZRL INOX - TEAM INFO.csv';
const sqlPath = 'import_data.sql';

if (!fs.existsSync(csvPath)) {
    console.error('File CSV non trovato!');
    process.exit(1);
}

const content = fs.readFileSync(csvPath, 'utf8');
const validTimes = ['06:00', '07:00', '07:30', '09:30', '10:30', '11:30', '12:00', '13:00', '14:00', '18:00', '18:30', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45'];

const lines = content.split(/\r?\n/);

// Funzione robusta per parse CSV
function parseCSVLine(text) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
        } else cur += char;
    }
    result.push(cur.trim());
    return result;
}

const header = parseCSVLine(lines[0]);

// Mappatura colonne
const colMap = {
    name: header.findIndex(h => h.toLowerCase().includes('rider')),
    category: header.findIndex(h => h.toLowerCase() === 'ce'),
    email: header.findIndex(h => h.toLowerCase().includes('mail')),
    teamName: header.findIndex(h => h.toLowerCase().includes('team') || h === ''), // Cerchiamo la colonna team
    zwid: header.findIndex(h => h.toLowerCase().includes('zwiftid'))
};

// Se teamName non è stato trovato (es. colonna vuota tra email e zwid), usiamo la posizione 3
if (colMap.teamName === -1) colMap.teamName = 3;

const timeCols = [];
header.forEach((h, i) => {
    const cleanH = h.trim();
    if (validTimes.includes(cleanH)) {
        timeCols.push({ index: i, time: cleanH });
    }
});

let sql = 'PRAGMA foreign_keys = OFF;\n';

validTimes.forEach((t, i) => {
    sql += `INSERT OR IGNORE INTO league_times (id, region, start_time_utc, display_name, slot_order) VALUES ('${t}', 'EMEA', '${t}', '${t} CEST', ${i});\n`;
});

const teamsFound = new Set();
let processedCount = 0;
let prefsCount = 0;

for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const cleanRow = parseCSVLine(lines[i]);
    const zwid = parseInt(cleanRow[colMap.zwid]);
    if (isNaN(zwid)) continue;

    const name = (cleanRow[colMap.name] || 'Unknown').replace(/'/g, "''");
    const cat = cleanRow[colMap.category] || 'N/A';
    const email = (cleanRow[colMap.email] || '').replace(/'/g, "''");
    const teamName = (cleanRow[colMap.teamName] || '').replace(/'/g, "''");

    sql += `INSERT INTO athletes (zwid, name, email, base_category, role) VALUES (${zwid}, '${name}', '${email}', '${cat}', 'user') ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, base_category=excluded.base_category;\n`;

    if (teamName && teamName !== 'CE' && teamName.length > 1) {
        if (!teamsFound.has(teamName)) {
            sql += `INSERT OR IGNORE INTO teams (name, category) VALUES ('${teamName}', '${cat}');\n`;
            teamsFound.add(teamName);
        }
        sql += `INSERT OR IGNORE INTO team_members (team_id, athlete_id) SELECT id, ${zwid} FROM teams WHERE name = '${teamName}';\n`;
    }

    sql += `DELETE FROM user_time_preferences WHERE zwid = ${zwid};\n`;
    timeCols.forEach(tc => {
        let val = cleanRow[tc.index];
        if (!val) return;
        
        let level = null;
        if (val.includes('💚')) level = 2;
        else if (val.includes('💛')) level = 1;
        else if (val.includes('⛔')) level = 0;
        
        if (level !== null) {
            sql += `INSERT INTO user_time_preferences (zwid, time_slot_id, preference_level) VALUES (${zwid}, '${tc.time}', ${level});\n`;
            prefsCount++;
        }
    });
    processedCount++;
}

sql += 'PRAGMA foreign_keys = ON;\n';
fs.writeFileSync(sqlPath, sql);
console.log(`✅ SQL: ${processedCount} atleti, ${prefsCount} preferenze. File: ${sqlPath}`);
