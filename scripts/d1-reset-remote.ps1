$DB = "team_inox_prod_v2"

Write-Host "🧨 Disabling foreign keys..."
wrangler d1 execute $DB --remote --command "PRAGMA foreign_keys = OFF;"

Write-Host "📦 Fetching table names safely..."

# USA query più pulita
$result = wrangler d1 execute $DB --remote --command "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'd1_%';"

# estrai SOLO parole (niente ASCII table parsing)
$tables = ($result | Select-String -Pattern "^[a-zA-Z0-9_]+$").Matches.Value

foreach ($t in $tables) {

    if ($t -and $t.Trim() -ne "") {
        Write-Host "Dropping: $t"
        wrangler d1 execute $DB --remote --command "DROP TABLE IF EXISTS \"$t\";"
    }
}

Write-Host "🔄 Applying migrations..."
wrangler d1 migrations apply $DB --remote

Write-Host "✅ RESET COMPLETED"