@echo off
setlocal

REM ========================================================
REM CONFIG (Dati presi dal wrangler.toml)
REM ========================================================
set JWT_SECRET=test_dev_secret_inoxteam_2026
set D1_DB_ID=c45289cd-c758-4a9b-85c8-3e06713df1e4

echo ========================================================
echo AVVIO COMPLETO INOXTEAM PLATFORM (DEV MODE)
echo ========================================================
echo Frontend + API: http://127.0.0.1:8788
echo Database ID: %D1_DB_ID%
echo ========================================================
echo.

REM ========================================================
REM STEP 1 - BUILD FRONTEND
REM ========================================================
echo [1/2] Build frontend...
call npm run build

IF %ERRORLEVEL% NEQ 0 (
    echo ERRORE nella build del frontend. STOP.
    pause
    exit /b
)

echo Build completata.
echo.

REM ========================================================
REM STEP 2 - AVVIO WRANGLER (SERVER UNIFICATO)
REM ========================================================
echo [2/2] Avvio Wrangler (Server API + Static Files)...
echo Verranno caricate le funzioni dalla cartella ./functions

:: Nota: Usiamo l'ID esatto per collegarci ai rider caricati.
:: Se i rider non appaiono, verifica che siano stati caricati in locale (--local)
:: e non sul cloud Cloudflare.

npx wrangler pages dev ./dist --local --d1 DB=%D1_DB_ID% --binding JWT_SECRET=%JWT_SECRET% --ip 127.0.0.1 --port 8788 --compatibility-date=2024-05-18

pause
endlocal
