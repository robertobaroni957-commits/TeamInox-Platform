const { execSync } = require('child_process');
const fs = require('fs');

// --- CONFIGURAZIONE ---
const INOX_CLUB_ID = 'cef70cde-9149-43a2-b3ae-187643a44703';
const SEASON_ID = "19";
const DB_NAME = "team_inox_db";

function getCookie() {
    if (fs.existsSync('.dev.vars')) {
        const vars = fs.readFileSync('.dev.vars', 'utf8');
        const match = vars.match(/WTRL_COOKIE="(.+)"/);
        if (match) return match[1];
    }
    return "";
}

const WTRL_COOKIE = getCookie();

async function sync() {
    console.log("🚀 AVVIO SINCRONIZZAZIONE GLOBALE E RESET...");
    
    if (!WTRL_COOKIE) {
        console.error("❌ Errore: WTRL_COOKIE non trovato in .dev.vars");
        return;
    }

    // 1. CREAZIONE SERIE E ROUND (Fondamentali per le Lineup)
    console.log("📅 Inizializzazione Stagione e Round...");
    execSql(`INSERT OR IGNORE INTO series (id, name, external_season_id, is_active) VALUES (1, 'ZRL Season 19', 19, 1);`);
    
    // Creiamo 8 round standard se non esistono
    for (let i = 1; i <= 8; i++) {
        execSql(`INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (${i}, 1, 'Round ${i}');`);
    }

    const wtrlIds = ["zrl", "wzrl"];
    let allTeams = [];

    for (const wtrlId of wtrlIds) {
        console.log(`📡 Fetching ${wtrlId} team list...`);
        const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=${wtrlId}&season=${SEASON_ID}&action=teamlist&test=dGVhbWxpc3Q%3D`;
        try {
            const response = await fetch(url, {
                headers: {
                    "cookie": WTRL_COOKIE,
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
                }
            });
            const data = await response.json();
            if (data.payload) allTeams = allTeams.concat(data.payload);
        } catch (e) { console.error(`❌ Errore fetch ${wtrlId}:`, e.message); }
    }

    const filteredTeams = allTeams.filter(t => {
        const teamName = (t.teamname || t.name || '').toUpperCase();
        const clubId = (t.clubId || t.club_id || '').toLowerCase();
        return (clubId === INOX_CLUB_ID.toLowerCase() || (teamName.includes('INOX') && !teamName.includes('EQUINOX')));
    });

    console.log(`🔍 Trovate ${filteredTeams.length} squadre INOX.`);

    for (const t of filteredTeams) {
        const wtrlTeamId = t.id || t.wtrl_team_id;
        const teamName = t.teamname || t.name;
        console.log(`\n📦 Sincronizzazione ${teamName}...`);

        // Inserimento Team
        execSql(`
            INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('${teamName.replace(/'/g, "''")}', '${t.division || ''}', '${t.zrldivision || ''}', ${parseInt(t.divnum) || 0}, ${wtrlTeamId}, '${INOX_CLUB_ID}', ${parseInt(t.members) || 0})
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
        `);

        // Roster
        try {
            const rosterUrl = `https://www.wtrl.racing/api/zrl/${SEASON_ID}/teams/${wtrlTeamId}`;
            const rosterRes = await fetch(rosterUrl, { headers: { "cookie": WTRL_COOKIE } });
            const rosterData = await rosterRes.json();
            const members = rosterData.riders || rosterData.members || [];

            if (members.length > 0) {
                // Rimuoviamo membri attuali per refresh pulito
                execSql(`DELETE FROM team_members WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = ${wtrlTeamId});`);

                for (const m of members) {
                    const zwid = m.zwid || m.profileId || m.zwiftId;
                    if (!zwid) continue;

                    // FIX AVATAR: Se l'avatar non è un URL completo, aggiungiamo il prefisso WTRL
                    let avatarUrl = m.avatar || m.avatar_url || '';
                    if (avatarUrl && !avatarUrl.startsWith('http')) {
                        avatarUrl = `https://www.wtrl.racing/uploads/profile_picture/${avatarUrl}`;
                    }

                    execSql(`
                        INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (${zwid}, '${m.name.replace(/'/g, "''")}', '${m.category || ''}', '${avatarUrl}')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = ${wtrlTeamId}), ${zwid});
                    `);
                }
                console.log(`   ✅ Roster: ${members.length} atleti sincronizzati (Avatar inclusi).`);
            }
        } catch (e) { console.error(`   ❌ Errore roster per ${teamName}:`, e.message); }
    }

    console.log("\n✨ SINCRONIZZAZIONE COMPLETATA CON SUCCESSO!");
    console.log("💡 Ora puoi segnare la disponibilità e creare le lineup sul sito.");
}

function execSql(sql) {
    const cleanSql = sql.replace(/\s+/g, " ").trim();
    try {
        execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command="${cleanSql}"`, { stdio: 'ignore' });
    } catch (e) {
        // Silenziamo errori minori (es: record duplicati già esistenti)
    }
}

sync();
