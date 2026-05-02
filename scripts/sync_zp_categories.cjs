const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const TEAM_ID = '16461';
const DB_NAME = "team_inox_db";
const SQL_TEMP_FILE = path.join(__dirname, 'temp_zp_sync.sql');

async function syncZP() {
    console.log(`🚀 STARTING ZWIFTPOWER CATEGORY SYNC (Team ID: ${TEAM_ID})...`);

    const LOCAL_FILE = path.join(__dirname, '..', 'riders.json');
    let riders = [];

    try {
        // Try fetching live first with the new API endpoint
        const url = `https://www.zwiftpower.com/api3.php?do=team_riders&id=${TEAM_ID}`;
        console.log(`📡 Attempting live fetch from: ${url}`);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            if (response.ok) {
                const data = await response.json();
                riders = data.data || data.riders || [];
                console.log("✅ Live data fetched successfully.");
            } else {
                console.log(`⚠️ Live fetch failed (${response.status}: ${response.statusText}). Checking for local file...`);
            }
        } catch (fetchErr) {
            console.log(`⚠️ Live fetch error: ${fetchErr.message}. Checking for local file...`);
        }

        // Fallback to local file if live fetch failed
        if (riders.length === 0 && fs.existsSync(LOCAL_FILE)) {
            console.log(`📂 Reading from local file: ${LOCAL_FILE}`);
            const localData = JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'));
            riders = localData.data || localData.riders || localData || [];
            console.log(`✅ Loaded ${riders.length} riders from local file.`);
        }

        if (riders.length === 0) {
            console.log("❌ ERROR: No rider data available. Please save the JSON from ZwiftPower as 'riders.json' in the root directory.");
            return;
        }

        console.log(`🔍 Found ${riders.length} riders on ZwiftPower.`);

        let sqlBuffer = `-- ZWIFTPOWER CATEGORY SYNC - ${new Date().toISOString()}\n`;
        let updateCount = 0;

        for (const r of riders) {
            const zwid = parseInt(r.zwift_id || r.zwid || r.profileId || r.userId);
            const category = (r.category || r.base_category || '').trim().toUpperCase();

            if (!zwid || !category) continue;

            // Mapping: ZP often uses 'A+', 'A', etc. 
            // We want to keep it consistent.
            let cleanCat = category;
            if (category === 'A+') cleanCat = 'APLUS';

            sqlBuffer += `UPDATE athletes SET base_category = '${cleanCat}' WHERE zwid = ${zwid};\n`;
            updateCount++;
        }

        if (updateCount > 0) {
            fs.writeFileSync(SQL_TEMP_FILE, sqlBuffer);
            console.log(`📡 Uploading ${updateCount} category updates to D1 (${DB_NAME})...`);
            
            execSync(`npx wrangler d1 execute ${DB_NAME} --remote --file="${SQL_TEMP_FILE}"`, { stdio: 'inherit' });
            console.log("✅ Categories updated successfully.");
            
            if (fs.existsSync(SQL_TEMP_FILE)) fs.unlinkSync(SQL_TEMP_FILE);
        } else {
            console.log("ℹ️ No valid updates found.");
        }

        console.log("\n✨ SYNC COMPLETED!");

    } catch (e) {
        console.error("❌ ERROR during sync:", e.message);
        if (fs.existsSync(SQL_TEMP_FILE)) fs.unlinkSync(SQL_TEMP_FILE);
    }
}

syncZP();
