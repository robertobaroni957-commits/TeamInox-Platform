@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ========================================================
REM INOXTEAM PLATFORM - STABLE VITE-FIRST WORKFLOW
REM ========================================================

set FRONTEND_PORT=5173
set WRANGLER_PORT=8788
set D1_DB_ID=63574bc1-97de-4d3e-8682-0e3b48739252

echo ========================================================
echo INOXTEAM PLATFORM - FINAL STABLE FIX
echo ========================================================

REM 1. CLEANUP
if exist dist rd /s /q dist
if exist node_modules\.vite rd /s /q node_modules\.vite
if exist temp_empty rd /s /q temp_empty

REM 2. STOP PREVIOUS
taskkill /F /FI "WINDOWTITLE eq WRANGLER*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq VITE*" >nul 2>&1
timeout /t 1 >nul

REM 3. START BACKEND (WRANGLER) - API only
echo [1/2] Starting Wrangler (API Backend)...
REM Note: We don't proxy here to avoid port-confusion in the browser.
start "WRANGLER" cmd /c "npx wrangler pages dev . --port %WRANGLER_PORT% --d1 ZRL_DB=%D1_DB_ID% --compatibility-date=2024-04-03"

echo Waiting for API to be ready...
timeout /t 5 >nul

REM 4. START FRONTEND (VITE) - Main Access Point
echo [2/2] Starting Vite (Frontend Engine)...
REM Vite handles all JS/TSX correctly and proxies /api to Wrangler.
start "VITE" cmd /c "npm run dev -- --port %FRONTEND_PORT%"

echo.
echo ========================================================
echo SYSTEM READY
echo.
echo >> ACCESS POINT: http://localhost:%FRONTEND_PORT% <<
echo ========================================================
echo.
echo Please use http://localhost:%FRONTEND_PORT% in your browser.
echo API requests are automatically proxied to port %WRANGLER_PORT%.
echo.
pause >nul

echo Stopping processes...
taskkill /F /FI "WINDOWTITLE eq WRANGLER*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq VITE*" >nul 2>&1
echo Done.
exit
