const fs = require('fs');
const path = require('path');

const jsonPath = 'quarantine-root-cleanup/experiments/squadre_inox.json';
const sqlPath = 'fix_avatars.sql';

if (!fs.existsSync(jsonPath)) {
    console.error('File JSON non trovato:', jsonPath);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let sql = '-- Emergency Avatar Fix\n';

const processedZwids = new Set();

data.forEach(entry => {
    const riders = entry.riders || [];
    riders.forEach(rider => {
        const zwid = rider.zwid || rider.profileId;
        if (!zwid || processedZwids.has(zwid)) return;
        
        if (rider.avatar && rider.avatar !== '' && !rider.avatar.includes('default.png')) {
            const avatar = rider.avatar.replace(/'/g, "''");
            sql += `UPDATE athletes SET avatar_url = '${avatar}' WHERE zwid = ${zwid};\n`;
            processedZwids.add(zwid);
        }
    });
});

fs.writeFileSync(sqlPath, sql);
console.log(`✅ Generati UPDATE per ${processedZwids.size} atleti in ${sqlPath}`);
