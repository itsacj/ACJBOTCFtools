@echo off
cd /d "%~dp0.."
echo [BAT] Starting bot...
npm run build
npm start
pause
