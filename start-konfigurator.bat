@echo off
cd /d "%~dp0"
echo.
echo  Starte Ticket-Konfigurator...
echo  Oeffne dann: http://localhost:3001
echo.
start "" "http://localhost:3001"
node server.js
pause
