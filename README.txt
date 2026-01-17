# ACJ DayZ CFTools Discord Bot

Bot de Discord para **DayZ Standalone** que utiliza la **API oficial de CFTools** para mostrar:
- Leaderboards
- Player stats detallados
- Información de servidores
- Integración con Steam (avatar / país)

Diseñado para **producción**, con **protección anti-crash mediante PM2**.

---

## 🚀 Características

- 📊 **Leaderboards DayZ**
  - Kills
  - KD
  - Playtime
  - Longest Kill / Shot
  - Suicides, Deaths, etc.

- 🧬 **PlayerStats**
  - Kills PVP / Infected / Animals
  - Deaths breakdown completo
  - KD real
  - Playtime (desde CFTools DB)
  - Arma favorita
  - Información Steam (avatar / país)

- 🛡️ **Protección Anti-Crash**
  - Reinicio automático con PM2
  - Manejo de errores globales
  - Estable en servidores Windows

---

## ⚠️ Limitación importante (CFTools API)

> **El ranking individual por jugador NO puede determinarse de forma fiable usando la API de CFTools.**

El endpoint de leaderboard:
- No expone identificadores estables (SteamID / CFToolsID)
- No permite asociar una fila del leaderboard a un jugador concreto

Por este motivo:
- El bot **NO adivina rankings**
- El ranking se consulta mediante `/leaderboard`
- El `/playerstats` no muestra posiciones falsas

Esto es una limitación del API, no del bot.

---

## 🧰 Requisitos

- Node.js **18+**
- NPM
- Cuenta y credenciales de **CFTools Cloud**
- Bot de Discord
- Windows (probado en Windows Server)

---

## 📦 Instalación

### 1️⃣ Clonar repositorio
```bash
git clone https://github.com/TU_USUARIO/ACJBOTCFtools.git
cd ACJBOTCFtools


Crea un archivo .env:

DISCORD_TOKEN=TU_TOKEN_DISCORD
CFTOOLS_API_APPLICATION_ID=TU_APP_ID
CFTOOLS_API_SECRET=TU_SECRET
STEAM_API_KEY=TU_STEAM_API_KEY

⚙️ Configuración de servidores

Edita config/servers.json:

[
  {
    "name": "Name",
    "serverApiId": "CFTOOLS_SERVER_API_ID"
  }
]

🛠️ Build y ejecución
Compilar
npm run build


El bot se ejecuta desde:

dist/index.js

🔒 Protección Anti-Crash (PM2)
Instalar PM2
npm install -g pm2

Iniciar el bot
pm2 start dist/index.js --name acj-dayz-bot
pm2 save

Comandos útiles
pm2 status
pm2 logs acj-dayz-bot
pm2 restart acj-dayz-bot
pm2 stop acj-dayz-bot

Arranque automático al iniciar Windows
pm2 startup
pm2 save

▶️ Scripts BAT (Windows)
start-bot.bat
pm2 start dist/index.js --name acj-dayz-bot
pm2 save

stop-bot.bat
pm2 stop acj-dayz-bot

MIT

🤝 Créditos

Desarrollado por ACJ
Inspirado en proyectos de la comunidad DayZ (ej. Mirasaki),
adaptado a limitaciones reales del API de CFTools.

🆘 Soporte

Si tienes problemas:

Revisa los logs con pm2 logs

Verifica tus credenciales CFTools

Comprueba servers.json

////////////////////////////////////////////////////

# ACJ DayZ CFTools Discord Bot

A Discord bot for **DayZ Standalone** that uses the **official CFTools API** to display:
- Leaderboards
- Detailed player statistics
- Server information
- Steam integration (avatar / country)

Designed for **production use**, with **automatic crash recovery using PM2**.

---

## 🚀 Features

- 📊 **DayZ Leaderboards**
  - Kills
  - KD
  - Playtime
  - Longest Kill / Longest Shot
  - Suicides, Deaths, and more

- 🧬 **Player Stats**
  - PVP / Infected / Animals kills
  - Full deaths breakdown
  - Real KD calculation
  - Playtime (from CFTools DB)
  - Favorite weapon
  - Steam info (avatar / country)

- 🛡️ **Anti-Crash Protection**
  - Automatic restart with PM2
  - Global error handling
  - Stable on Windows servers

---

## ⚠️ Important Limitation (CFTools API)

> **Individual player ranking positions cannot be reliably determined using the CFTools API.**

The leaderboard endpoint:
- Does not expose stable identifiers (SteamID / CFToolsID)
- Does not allow mapping a leaderboard row to a specific player

For this reason:
- The bot **does not guess rankings**
- Rankings are consulted via `/leaderboard`
- `/playerstats` does not display incorrect positions

This is an API limitation, not a bot bug.

---

## 🧰 Requirements

- Node.js **18+**
- NPM
- **CFTools Cloud** account and credentials
- Discord Bot token
- Windows (tested on Windows Server)

---

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ACJBOTCFtools.git
cd ACJBOTCFtools
2️⃣ Install dependencies
bash
Copiar código
npm install
3️⃣ Environment configuration
Create a .env file:

env
Copiar código
DISCORD_TOKEN=YOUR_DISCORD_TOKEN
CFTOOLS_API_APPLICATION_ID=YOUR_APP_ID
CFTOOLS_API_SECRET=YOUR_SECRET
STEAM_API_KEY=YOUR_STEAM_API_KEY
⚙️ Server configuration
Edit config/servers.json:

json
Copiar código
[
  {
    "name": "NAME",
    "serverApiId": "CFTOOLS_SERVER_API_ID"
  }
]
🛠️ Build & Run
Build the project
bash
Copiar código
npm run build
The bot runs from:

bash
Copiar código
dist/index.js
🔒 Anti-Crash Protection (PM2)
Install PM2
bash
Copiar código
npm install -g pm2
Start the bot
bash
Copiar código
pm2 start dist/index.js --name acj-dayz-bot
pm2 save
Useful commands
bash
Copiar código
pm2 status
pm2 logs acj-dayz-bot
pm2 restart acj-dayz-bot
pm2 stop acj-dayz-bot
Auto-start on Windows boot
bash
Copiar código
pm2 startup
pm2 save
▶️ Windows BAT Scripts
start-bot.bat
bat
Copiar código
pm2 start dist/index.js --name acj-dayz-bot
pm2 save
stop-bot.bat
bat
Copiar código
pm2 stop acj-dayz-bot
📚 Tech Stack
TypeScript

Discord.js

CFTools SDK

Steam Web API

PM2

📄 License

MIT

🤝 Credits

Developed by ACJ
Inspired by DayZ community projects (e.g. Mirasaki),
adapted to real-world CFTools API limitations.

🆘 Support

If you encounter issues:

Check logs with pm2 logs

Verify your CFTools credentials

Review servers.json