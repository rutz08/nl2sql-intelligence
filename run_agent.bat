@echo off
TITLE COSEC NL2SQL Agent Launcher
echo Starting COSEC Intelligence Agent...
echo -----------------------------------
echo Checking Node.js version...
node --version
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    pause
    exit /b
)
echo Launching server...
node core/nl2sql_agent.js
pause
