@echo off
setlocal EnableExtensions EnableDelayedExpansion

set FRONTEND_PORT=5173
set WRANGLER_PORT=8788

set WRANGLER_PORT=8788
set D1_DB_ID=5bc66f8c-227f-4492-9361-d32f2a07b53a

echo ============================================
echo INOXTEAM DEV (STABLE MODE)
echo ============================================

if not exist logs mkdir logs

REM ❌ NON uccidere tutto Node globalmente
REM taskkill /F /IM node.exe >nul 2>&1

echo [1] Starting Wrangler...
start cmd /k "npx wrangler pages dev dist --port %WRANGLER_PORT% --d1 ZRL_DB=%D1_DB_ID% --d1 WINTER_TOUR_DB=winter_tour_db"

timeout /t 3 >nul

echo [2] Starting Vite...
start cmd /k "npm run dev"

echo ============================================
echo READY:
echo Frontend: http://127.0.0.1:%FRONTEND_PORT%
echo Backend : http://127.0.0.1:%WRANGLER_PORT%
echo ============================================
pause