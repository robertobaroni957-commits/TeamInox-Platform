const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- CONFIGURAZIONE ---
const INOX_CLUB_ID = 'cef70cde-9149-43a2-b3ae-187643a44703';
const SEASON_ID = "19";          // WTRL Season 19
const INTERNAL_SERIES_ID = 1;    // Season 2025
const INTERNAL_ROUND_ID = 4;     // Mappa su Round 4 della Season 2025
const DB_NAME = "team_inox_db";
const SQL_TEMP_FILE = path.join(__dirname, 'temp_sync.sql');
const VARS_PATH = path.join(__dirname, '..', '.dev.vars');

function getCookie() {
    if (fs.existsSync(VARS_PATH)) {
        const vars = fs.readFileSync(VARS_PATH, 'utf8');
        // Regex più robusta che cerca WTRL_COOKIE= seguita da qualcosa tra virgolette o fino a fine riga
        const match = vars.match(/WTRL_COOKIE=["']?(.+?)["']?(\r?\n|$)/);
        if (match) return match[1].trim();
    }
    return "";
}

const WTRL_COOKIE = getCookie();
let sqlBuffer = "";

function addSql(sql) {
    sqlBuffer += sql.trim() + (sql.trim().endsWith(';') ? '' : ';') + "\n";
}

async function flushSql() {
    if (sqlBuffer.trim() === "") return;
    
    fs.writeFileSync(SQL_TEMP_FILE, sqlBuffer);
    
    console.log(`📡 Caricamento dati su D1 (${DB_NAME})...`);
    try {
        // Usiamo --remote per caricare sul database di produzione
        execSync(`npx wrangler d1 execute ${DB_NAME} --remote --file="${SQL_TEMP_FILE}"`, { stdio: 'inherit' });
        console.log("✅ Dati caricati con successo.");
    } catch (e) {
        console.error("❌ Errore durante l'esecuzione SQL su D1.");
        process.exit(1);
    } finally {
        if (fs.existsSync(SQL_TEMP_FILE)) fs.unlinkSync(SQL_TEMP_FILE);
        sqlBuffer = "";
    }
}

async function sync() {
    console.log(`🚀 AVVIO SINCRONIZZAZIONE ZRL (WTRL S${SEASON_ID} -> INOX Round ${INTERNAL_ROUND_ID})...`);
    
    if (!WTRL_COOKIE) {
        console.error("❌ Errore: WTRL_COOKIE non trovato in .dev.vars. Effettua il login su WTRL e aggiorna il cookie.");
        return;
    }

    // 1. Inizializzazione Stagione e Round specifico (Mappa WTRL S19 -> Round 4)
    addSql(`INSERT OR IGNORE INTO series (id, name, external_season_id, is_active) VALUES (${INTERNAL_SERIES_ID}, 'Season 2025', ${SEASON_ID}, 1);`);
    addSql(`INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (${INTERNAL_ROUND_ID}, ${INTERNAL_SERIES_ID}, 'Round 4');`);

    const wtrlIds = ["zrl", "wzrl"];
    let allTeams = [];

    for (const wtrlId of wtrlIds) {
        console.log(`📡 Recupero lista team ${wtrlId.toUpperCase()}...`);
        try {
            const res = await fetch(`https://www.wtrl.racing/api/wtrlruby/?wtrlid=${wtrlId}&season=${SEASON_ID}&action=teamlist&test=dGVhbWxpc3Q%3D`, {
                headers: { "cookie": WTRL_COOKIE, "user-agent": "Mozilla/5.0" }
            });
            const data = await res.json();
            if (data.payload) allTeams = allTeams.concat(data.payload);
        } catch (e) { 
            console.error(`❌ Errore fetch ${wtrlId}:`, e.message); 
        }
    }

    const filteredTeams = allTeams.filter(t => {
        const teamName = (t.teamname || t.name || '').toUpperCase();
        const clubId = (t.clubId || t.club_id || '').toLowerCase();
        return (clubId === INOX_CLUB_ID.toLowerCase() || (teamName.includes('INOX') && !teamName.includes('EQUINOX')));
    });

    console.log(`🔍 Trovati ${filteredTeams.length} team INOX.`);

    for (const t of filteredTeams) {
        const wtrlTeamId = t.id || t.wtrl_team_id;
        const teamName = t.teamname || t.name;
        console.log(`\n📦 Elaborazione ${teamName} (ID: ${wtrlTeamId})...`);

        addSql(`
            INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('${teamName.replace(/'/g, "''")}', '${t.division || ''}', '${t.zrldivision || ''}', ${parseInt(t.divnum) || 0}, ${wtrlTeamId}, '${INOX_CLUB_ID}', ${parseInt(t.members) || 0})
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
        `);

        try {
            const rosterRes = await fetch(`https://www.wtrl.racing/api/zrl/${SEASON_ID}/teams/${wtrlTeamId}`, { headers: { "cookie": WTRL_COOKIE } });
            const rosterData = await rosterRes.json();
            const members = rosterData.riders || rosterData.members || [];

            if (members.length > 0) {
                // Pulizia team_members per ricostruire il roster aggiornato
                addSql(`DELETE FROM team_members WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = ${wtrlTeamId});`);

                for (const m of members) {
                    const zwid = m.zwid || m.profileId || m.zwiftId;
                    if (!zwid) continue;

                    let avatar = m.avatar || m.avatar_url || '';
                    if (avatar && !avatar.startsWith('http')) {
                        if (avatar.includes('/')) avatar = `https://www.wtrl.racing${avatar}`;
                        else avatar = `https://www.wtrl.racing/uploads/profile_picture/${avatar}`;
                    }

                    addSql(`
                        INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (${zwid}, '${m.name.replace(/'/g, "''")}', '${m.category || ''}', '${avatar}')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = ${wtrlTeamId}), ${zwid});
                    `);

                    // Disponibilità solo per il round interno corrente (Round 4)
                    addSql(`INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (${zwid}, ${INTERNAL_ROUND_ID}, 'available');`);
                }
                console.log(`   ✅ Roster: ${members.length} atleti pronti.`);
            }
        } catch (e) { 
            console.error(`   ❌ Errore roster per ${teamName}:`, e.message); 
        }
    }

    await flushSql();
    console.log("\n✨ SINCRONIZZAZIONE COMPLETATA CON SUCCESSO!");
}

sync();
