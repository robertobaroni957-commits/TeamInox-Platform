const fs = require('fs');

const data = JSON.parse(fs.readFileSync('squadre_inox.json', 'utf8'));
const round_group_id = 1;

let sql = 'PRAGMA foreign_keys = OFF;\n';

data.forEach((entry, index) => {
    const meta = entry.meta;
    const team = meta.team;
    const comp = meta.competition;
    const league_key = comp.class;
    const league_name = meta.division;
    const team_name = team.name;
    
    // Create a few random teams for each division to make it interesting
    sql += `-- League: ${league_name} (${league_key})\n`;
    
    // The Inox Team
    sql += `INSERT OR IGNORE INTO zrl_team_standings (round_group_id, league_key, league_name, team_name, rank, league_points, pts_fal, pts_fts, pts_finish, total_race_points, r1, r2, r3, r4, r5, r6, is_inox)
VALUES (${round_group_id}, '${league_key}', '${league_name}', '${team_name.replace(/'/g, "''")}', 1, 100, 40, 30, 150, 220, '20', '20', '20', '20', '20', '', 1);\n`;

    // A competitor
    sql += `INSERT OR IGNORE INTO zrl_team_standings (round_group_id, league_key, league_name, team_name, rank, league_points, pts_fal, pts_fts, pts_finish, total_race_points, r1, r2, r3, r4, r5, r6, is_inox)
VALUES (${round_group_id}, '${league_key}', '${league_name}', 'Competitor ${index + 1}', 2, 95, 30, 40, 120, 190, '19', '19', '19', '19', '19', '', 0);\n`;
});

sql += 'PRAGMA foreign_keys = ON;\n';
fs.writeFileSync('seed_more_standings.sql', sql);
console.log("SQL generato.");
