@echo off
setlocal
set JWT_SECRET=test_dev_secret_inoxteam_2026
echo ========================================================
echo AVVIO COMPLETO INOXTEAM PLATFORM (UNIFIED DEV)
echo ========================================================
echo Frontend: Vite (React + TypeScript) on :5173
echo Backend:  Cloudflare Pages + D1 Database on :8788
echo ========================================================
echo.

echo [1/2] Avvio del Frontend (Vite)...
start "Vite - Inoxteam Frontend" cmd /c "npm run dev"

echo [2/2] Avvio del Backend (Wrangler)...
echo (Configurazione D1: inox_auth_db)
start "Wrangler - Inoxteam Backend" cmd /c "npx wrangler pages dev --local --d1 DB=c45289cd-c758-4a9b-85c8-3e06713df1e4 --binding JWT_SECRET=%JWT_SECRET% --proxy 5173"

echo.
echo Attendere il caricamento dei servizi (5 secondi)...
timeout /t 5 /nobreak > nul

echo.
echo Apertura del browser su http://localhost:8788 ...
start http://localhost:8788

echo.
echo Procedura completata.
echo Usa la finestra di Wrangler per monitorare le chiamate API (/api/*).
echo Usa la finestra di Vite per monitorare il log del frontend.
echo.
pause
endlocal
