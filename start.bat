@echo off
cd /d "%~dp0"
echo Starte Ticket-Bot...
echo.
npm install
echo.
node index.js
pause
