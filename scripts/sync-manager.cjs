const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.clear();
    console.log("====================================================");
    console.log("          🚀 INOXTEAM DATA SYNC MANAGER             ");
    console.log("====================================================");
    console.log("1. [ZRL] Sincronizza Roster e Team (WTRL -> D1)");
    console.log("2. [MWT] Sincronizza Winter Tour (Coming Soon)");
    console.log("3. [LIVE] Sincronizza Gare Live Strava (Coming Soon)");
    console.log("----------------------------------------------------");
    console.log("4. [CONFIG] Aggiorna WTRL_COOKIE (.dev.vars)");
    console.log("5. [D1] Verifica Connessione Database");
    console.log("0. Esci");
    console.log("====================================================");

    rl.question("\nScegli un'opzione: ", async (choice) => {
        switch (choice) {
            case '1':
                console.log("\n📦 Avvio Sincronizzazione ZRL...");
                runNodeScript('scripts/sync_inox_data.cjs');
                break;
            case '4':
                updateCookie();
                break;
            case '5':
                console.log("\n📡 Verifica connessione D1...");
                try {
                    execSync('npx wrangler d1 execute team_inox_db --remote --command="SELECT name FROM series LIMIT 1"', { stdio: 'inherit' });
                    console.log("\n✅ Connessione D1 OK.");
                } catch (e) {
                    console.error("\n❌ Errore di connessione a D1. Verifica 'npx wrangler login'.");
                }
                waitAndReturn();
                break;
            case '0':
                console.log("Arrivederci!");
                process.exit(0);
                break;
            default:
                console.log("Opzione non valida.");
                setTimeout(main, 1000);
        }
    });
}

function runNodeScript(scriptPath) {
    try {
        // Usiamo inherit per vedere l'output reale in UTF-8 senza problemi di encoding Python
        execSync(`node ${scriptPath}`, { stdio: 'inherit' });
        console.log("\n✅ Operazione completata.");
    } catch (e) {
        console.error("\n❌ Errore durante l'esecuzione dello script.");
    }
    waitAndReturn();
}

function updateCookie() {
    console.log("\n--- AGGIORNAMENTO COOKIE WTRL ---");
    console.log("1. Apri il browser e loggati su WTRL");
    console.log("2. Ispeziona (F12) -> Application -> Cookies -> https://www.wtrl.racing");
    console.log("3. Copia il contenuto di tutti i cookie o incolla qui la stringa raw");
    
    rl.question("\nIncolla qui il nuovo cookie: ", (cookie) => {
        if (!cookie.trim()) {
            console.log("Annullato.");
            return main();
        }
        
        const varsPath = path.join(__dirname, '..', '.dev.vars');
        let content = "";
        if (fs.existsSync(varsPath)) {
            content = fs.readFileSync(varsPath, 'utf8');
        }

        if (content.includes('WTRL_COOKIE=')) {
            content = content.replace(/WTRL_COOKIE=".+?"/, `WTRL_COOKIE="${cookie.trim()}"`);
        } else {
            content += `\nWTRL_COOKIE="${cookie.trim()}"`;
        }

        fs.writeFileSync(varsPath, content.trim());
        console.log("\n✅ Cookie aggiornato con successo in .dev.vars");
        waitAndReturn();
    });
}

function waitAndReturn() {
    rl.question("\nPremi INVIO per tornare al menu...", () => {
        main();
    });
}

main();
