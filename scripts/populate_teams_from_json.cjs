const fs = require('fs');

const jsonPath = 'squadre_inox.json';
const sqlPath = 'populate_teams.sql';

if (!fs.existsSync(jsonPath)) {
    console.error('File JSON non trovato!');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let sql = 'PRAGMA foreign_keys = OFF;\n';

// Prima cerchiamo di mappare i nomi esistenti agli ID WTRL
data.forEach(entry => {
    const meta = entry.meta;
    if (!meta || !meta.team) return;

    const team = meta.team;
    const comp = meta.competition;
    
    const name = team.name.replace(/'/g, "''");
    const wtrl_team_id = meta.trc || team.teamid;
    const tttid = team.tttid;
    const category = comp.division;
    const division = meta.division.replace(/'/g, "''");
    const leagueKey = comp.class || '';
    const member_count = meta.memberCount || 0;
    const is_dev = team.isdev ? 1 : 0;

    let league = '';
    let divNum = null;

    const match = leagueKey.match(/^(\d+)0([A-D])(\d+)0$/);
    if (match) {
        league = match[1];
        divNum = parseInt(match[3]);
    } else {
        // Fallback for keys like 2410A0
        const simpleMatch = leagueKey.match(/^(\d+)0([A-D])(\d*)$/);
        if (simpleMatch) {
            league = simpleMatch[1];
            divNum = simpleMatch[3] ? parseInt(simpleMatch[3]) : null;
        }
    }

    // Usiamo un INSERT OR REPLACE o un UPDATE complesso
    // Se il team esiste già per nome, lo aggiorniamo. Se esiste per wtrl_team_id, lo aggiorniamo.
    // Altrimenti lo inseriamo.
    
    sql += `-- Processing ${team.name}\n`;
    sql += `INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('${name}', '${category}', '${division}', ${divNum}, ${wtrl_team_id}, ${tttid}, '${league}', ${member_count}, ${is_dev})
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;\n`;
    
    // Se c'è un record con lo stesso nome ma senza wtrl_team_id, uniamoli
    sql += `UPDATE teams SET 
    category = '${category}', 
    division = '${division}', 
    division_number = ${divNum}, 
    wtrl_team_id = ${wtrl_team_id}, 
    tttid = ${tttid}, 
    league = '${league}', 
    member_count = ${member_count}, 
    is_dev = ${is_dev}
WHERE name = '${name}' AND wtrl_team_id IS NULL;\n\n`;
});

sql += 'PRAGMA foreign_keys = ON;\n';

fs.writeFileSync(sqlPath, sql);
console.log(`✅ SQL generato in ${sqlPath} per ${data.length} squadre.`);
