# ================================
# INOXTEAM UNIFIED DEV ENVIRONMENT
# React/Vite + Cloudflare Functions
# ================================

Write-Host "=== INOXTEAM UNIFIED LOCAL DEV ==="
Write-Host "Frontend: Vite (React + TS)"
Write-Host "Backend: Cloudflare Functions + D1"
Write-Host "==================================="
Write-Host ""

# 1. Imposta variabili locali
$env:JWT_SECRET = "test_dev_secret_inoxteam_2026"
$env:DB = "c45289cd-c758-4a9b-85c8-3e06713df1e4"

# 2. Avvia Vite in una nuova finestra
Write-Host "[1/2] Avvio Vite (frontend)..."
Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# 3. Avvia Wrangler in una nuova finestra
Write-Host "[2/2] Avvio Wrangler (backend + D1)..."
Start-Process powershell -ArgumentList "npx wrangler dev --local --d1 DB=$env:DB --binding JWT_SECRET=$env:JWT_SECRET" -WindowStyle Normal

Start-Sleep -Seconds 2

# 4. Apri il browser automaticamente
Write-Host "Apertura browser su http://localhost:5173 ..."
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "=== AMBIENTE DI SVILUPPO PRONTO ==="
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:8787 (Wrangler)"
Write-Host "===================================="
