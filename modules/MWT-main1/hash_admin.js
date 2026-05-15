// hash_admin.js

// Hash function compatible with Web Crypto API (for Workers)
async function hashPassword(password) {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashedPassword;
}

// ⚠️ CAMBIARE QUESTA PASSWORD CON LA TUA SCELTA FINALE ⚠️
const ADMIN_PASSWORD = 'test123456'; 

async function generateHash() {
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);
    console.log('\n================================================================');
    console.log('✅ HASH GENERATO (COPIA TUTTA LA STRINGA):');
    console.log(hashedPassword);
    console.log('================================================================');
}

generateHash();