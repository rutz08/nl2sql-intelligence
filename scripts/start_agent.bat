@echo off
echo ==========================================
echo   COSEC HYBRID NL2SQL AGENT LAUNCHER
echo ==========================================
echo.
cd /d "%~dp0.."
echo [1/2] Training/Syncing Master Brain...
python intelligence/lstm_skill_model.py
echo.
echo [2/2] Starting Node.js API Middleware...
node core/nl2sql_agent.js
pause
