@echo off
title SAHAY COSEC Intelligence Bot
echo Starting SAHAY NL2SQL Engine...

:: Set Groq API Key (Falls back to the one found in llm council if not set)
set GROQ_API_KEY=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

:: Navigate to the agent directory
cd /d "%~dp0"

:: Check for node_modules and install if missing
if not exist "node_modules\" (
    echo [System] node_modules not found. Installing dependencies...
    npm install
)

:: Start the Node.js Backend
echo Starting Node.js server on http://localhost:3000...
start /b node nl2sql_agent.js

:: Wait for a second to let the server start
timeout /t 2 /nobreak > nul

:: Open the Frontend
echo Opening Antigravity Dashboard...
start "" "react_frontend.html"

echo.
echo ======================================================
echo Antigravity Bot is now RUNNING!
echo Backend: http://localhost:3000
echo Frontend: react_frontend.html (Opened in browser)
echo ======================================================
echo Keep this window open while using the bot.
echo.
pause
