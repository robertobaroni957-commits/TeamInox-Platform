@echo off
setlocal
set JWT_SECRET=test_dev_secret_inoxteam_2026
echo --- STARTING INOXTEAM UNIFIED LOCAL SERVER ---
echo --- Serving React + Cloudflare Functions ---
echo ----------------------------------------------
npx wrangler pages dev . --local --d1 DB=c45289cd-c758-4a9b-85c8-3e06713df1e4 --binding JWT_SECRET=%JWT_SECRET%
endlocal
