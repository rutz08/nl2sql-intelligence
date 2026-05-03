@echo off
echo ==========================================
echo   COSEC HYBRID NL2SQL AGENT LAUNCHER
echo ==========================================
echo.
echo [1/2] Training/Syncing LSTM Brain...
python lstm_skill_model.py
echo.
echo [2/2] Starting Node.js API Middleware...
node nl2sql_agent.js
pause
