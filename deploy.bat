@echo off
cd /d "%~dp0.."
echo [BAT] Deploying commands...
npm run build
node dist/deploy-commands.js
pause
