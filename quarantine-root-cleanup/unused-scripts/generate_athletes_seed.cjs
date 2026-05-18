const fs = require('fs');

const data = JSON.parse(fs.readFileSync('squadre_inox.json', 'utf8'));
let sql = 'PRAGMA foreign_keys = OFF;\n';

data.forEach(entry => {
    const riders = entry.riders || [];
    riders.forEach(r => {
        const zwid = r.profileId;
        const name = r.name.replace(/'/g, "''");
        const cat = r.category || 'N/A';
        const zftp = r.zftp || 0;
        const zftpw = r.zftpw || 0;
        const zmap = r.zmap || 0;
        const zmapw = r.zmapw || 0;
        
        sql += `INSERT OR IGNORE INTO athletes (zwid, name, base_category, role, zftp, zftpw, zmap, zmapw, profile_id) 
VALUES (${zwid}, '${name}', '${cat}', 'user', ${zftp}, ${zftpw}, ${zmap}, ${zmapw}, ${zwid});\n`;
    });
});

sql += 'PRAGMA foreign_keys = ON;\n';
fs.writeFileSync('seed_athletes.sql', sql);
console.log("SQL atleti generato.");
