@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ========================================================
REM INOXTEAM PLATFORM - STABLE VITE-FIRST WORKFLOW
REM ========================================================

set FRONTEND_PORT=5173
set WRANGLER_PORT=8788
set D1_DB_ID=5bc66f8c-227f-4492-9361-d32f2a07b53a

echo ========================================================
echo INOXTEAM PLATFORM - STARTUP ENGINE
echo ========================================================

REM 1. CLEANUP (Solo cache temporanee, non lo stato del DB)
if exist node_modules\.vite rd /s /q node_modules\.vite

REM 2. STOP PREVIOUS
taskkill /F /FI "WINDOWTITLE eq WRANGLER*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq VITE*" >nul 2>&1
timeout /t 1 >nul

REM 3. START BACKEND (WRANGLER)
echo [1/2] Starting Wrangler (API Backend)...
REM Usiamo la data di compatibilità corretta e l'IP esplicito
start "WRANGLER" cmd /k "npx wrangler pages dev . --port %WRANGLER_PORT% --d1 ZRL_DB=%D1_DB_ID% --compatibility-date=2026-05-18 --ip 127.0.0.1"

echo Waiting for API to be ready (5s)...
timeout /t 5 >nul

REM 4. START FRONTEND (VITE)
echo [2/2] Starting Vite (Frontend Engine)...
start "VITE" cmd /k "npm run dev -- --port %FRONTEND_PORT%"

echo.
echo ========================================================
echo SYSTEM READY
echo.
echo >> ACCESS POINT: http://localhost:%FRONTEND_PORT% <<
echo ========================================================
echo.
echo Se vedi errori nel terminale di Wrangler, controlla functions/api/
echo.
pause
