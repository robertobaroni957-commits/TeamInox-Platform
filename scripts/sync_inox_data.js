const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- CONFIGURAZIONE ---
const INOX_CLUB_ID = 'cef70cde-9149-43a2-b3ae-187643a44703';
const SEASON_ID = "19";
const DB_NAME = "team_inox_db"; // Nome del database in wrangler.toml

// Estrazione Cookie da wrangler.toml o .dev.vars
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
    console.log("🚀 Inizio sincronizzazione locale per Stagione:", SEASON_ID);
    
    if (!WTRL_COOKIE) {
        console.error("❌ Errore: WTRL_COOKIE non trovato in .dev.vars");
        return;
    }

    const wtrlIds = ["zrl", "wzrl"];
    let allTeams = [];

    for (const wtrlId of wtrlIds) {
        console.log(`📡 Scaricamento lista squadre per ${wtrlId}...`);
        const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=${wtrlId}&season=${SEASON_ID}&action=teamlist&test=dGVhbWxpc3Q%3D`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    "cookie": WTRL_COOKIE,
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
                }
            });
            const data = await response.json();
            if (data.payload) {
                allTeams = allTeams.concat(data.payload);
                console.log(`✅ Ricevute ${data.payload.length} squadre da ${wtrlId}`);
            }
        } catch (e) {
            console.error(`❌ Errore fetch ${wtrlId}:`, e.message);
        }
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
        console.log(`\n📦 Sincronizzazione ${teamName} (WTRL ID: ${wtrlTeamId})...`);

        // 1. Inserimento/Aggiornamento Team
        const teamSql = `
            INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('${teamName.replace(/'/g, "''")}', '${t.division || ''}', '${t.zrldivision || ''}', ${parseInt(t.divnum) || 0}, ${wtrlTeamId}, '${INOX_CLUB_ID}', ${parseInt(t.members) || 0})
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
        `;
        
        execSql(teamSql);

        // 2. Scaricamento Roster
        console.log(`   👥 Scaricamento roster...`);
        try {
            const rosterUrl = `https://www.wtrl.racing/api/zrl/${SEASON_ID}/teams/${wtrlTeamId}`;
            const rosterRes = await fetch(rosterUrl, { headers: { "cookie": WTRL_COOKIE } });
            const rosterData = await rosterRes.json();
            const members = rosterData.riders || rosterData.members || [];

            if (members.length > 0) {
                // Pulizia roster precedente per questo team
                execSql(`DELETE FROM team_members WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = ${wtrlTeamId});`);

                for (const m of members) {
                    const zwid = m.zwid || m.profileId || m.zwiftId;
                    if (!zwid) continue;

                    const athleteSql = `
                        INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (${zwid}, '${m.name.replace(/'/g, "''")}', '${m.category || ''}', '${m.avatar || ''}')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = ${wtrlTeamId}), ${zwid});
                    `;
                    execSql(athleteSql);
                }
                console.log(`   ✅ Roster aggiornato: ${members.length} atleti.`);
            }
        } catch (e) {
            console.error(`   ❌ Errore roster:`, e.message);
        }
    }

    console.log("\n✨ Sincronizzazione completata!");
}

function execSql(sql) {
    // Rimuoviamo eventuali a capo per la CLI
    const cleanSql = sql.replace(/\n/g, " ").trim();
    try {
        // Eseguiamo il comando Wrangler per D1 (Remoto)
        execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command="${cleanSql}"`, { stdio: 'ignore' });
    } catch (e) {
        console.error("   ⚠️ Errore esecuzione SQL:", e.message);
    }
}

sync();
