@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ========================================================
REM INOXTEAM DEV ORCHESTRATOR (STABLE MODE)
REM ========================================================

set FRONTEND_PORT=5173
set WRANGLER_PORT=8788

set D1_DB_ID=63574bc1-97de-4d3e-8682-0e3b48739252

echo ========================================================
echo INOXTEAM PLATFORM DEV (STABLE MODE)
echo ========================================================
echo Frontend : http://127.0.0.1:%FRONTEND_PORT%
echo Backend  : http://127.0.0.1:%WRANGLER_PORT%
echo ========================================================
echo.

if not exist logs mkdir logs

REM ========================================================
REM STOP PREVIOUS ONLY (SAFE)
REM ========================================================

echo Stopping previous instances...
taskkill /F /FI "WINDOWTITLE eq WRANGLER*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq VITE*" >nul 2>&1

timeout /t 2 >nul

REM ========================================================
REM BUILD
REM ========================================================

echo [1/3] Building frontend...
call npm run build > logs\build.log 2>&1

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed. Check logs\build.log
    pause
    exit /b
)

echo Build OK.
echo.

REM ========================================================
REM START BACKEND (WRANGLER)
REM ========================================================

echo [2/3] Starting Wrangler (Backend)...
REM Nota: il binding è ZRL_DB per corrispondere al codice backend
start "WRANGLER" cmd /k "npx wrangler pages dev dist --port %WRANGLER_PORT% --d1 ZRL_DB=%D1_DB_ID% --persist-to .wrangler/state"

timeout /t 5 >nul

REM ========================================================
REM START FRONTEND (VITE)
REM ========================================================

echo [3/3] Starting Vite (Frontend)...
start "VITE" cmd /k "npm run dev"

echo.
echo ========================================================
echo SYSTEM RUNNING
echo ========================================================
echo Frontend: http://127.0.0.1:%FRONTEND_PORT%
echo Backend:  http://127.0.0.1:%WRANGLER_PORT%
echo ========================================================
echo.
pause
