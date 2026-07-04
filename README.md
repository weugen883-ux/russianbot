# 🎫 Ticket-Bot

Schlanker Discord-Bot mit Ticket-System (4 Kategorien, passend zu deinem Referenzdesign).
Erweiterbar um weitere Slash-Commands.

## 📁 Struktur

```
ticket-bot/
├── index.js                  # Einstiegspunkt
├── deploy-commands.js        # Registriert Slash-Commands bei Discord
├── config/
│   └── ticketTypes.js        # Hier Ticket-Kategorien anpassen (Texte, Farben, Emojis)
├── commands/
│   └── setupTickets.js       # /setup-tickets Befehl
├── events/
│   ├── ready.js
│   └── interactionCreate.js  # Verarbeitet Button-Klicks & Commands
├── utils/
│   ├── buildTicketPanel.js   # Baut die Panel-Nachricht mit den 4 Buttons
│   ├── createTicket.js       # Erstellt privaten Ticket-Channel
│   └── closeTicket.js        # Schließt & löscht Ticket-Channel
└── .env                      # Deine Tokens & IDs (NICHT teilen!)
```

## 🚀 Setup

### 1. Discord Developer Portal

1. Neue Application erstellen unter https://discord.com/developers/applications
2. Im Tab **Bot**: Bot erstellen, Token kopieren
3. Privileged Gateway Intents aktivieren:
   - ✅ Server Members Intent
   - ✅ Message Content Intent (optional für später)
4. Im Tab **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Manage Channels`, `View Channels`, `Send Messages`, `Embed Links`, `Read Message History`
5. Generierten Link öffnen und Bot auf deinen Server einladen

### 2. Environment Variables

Kopiere `.env.example` zu `.env` (oder trage die Werte in Replit Secrets ein) und fülle aus:

```
DISCORD_BOT_TOKEN=dein_bot_token
CLIENT_ID=application_id_aus_dem_developer_portal
SUPPORT_ROLE_ID=role_id_deiner_support_rolle
TICKET_CATEGORY_ID=  (optional)
LOG_CHANNEL_ID=      (optional)
```

> ⚠️ **Wichtig:** `.env` niemals committen oder im Chat teilen! Auf Replit gehört das alles in die "Secrets" (🔒-Symbol), nicht in eine Datei.

### 3. Installieren & Starten

```bash
npm install
node deploy-commands.js   # einmalig, registriert /setup-tickets
node index.js             # startet den Bot
```

### 4. Ticket-Panel posten

Im gewünschten Channel auf deinem Server (als Admin):

```
/setup-tickets
```

Das postet die 4 Buttons (Rolle/Bug/Mod-Report/Member-Report), genau wie in deiner Vorlage.

## 🔧 Anpassen

- **Texte/Farben/Emojis ändern:** `config/ticketTypes.js`
- **Wer Zugriff auf Tickets hat:** `SUPPORT_ROLE_ID` in `.env`
- **Kategorie für Ticket-Channels:** `TICKET_CATEGORY_ID` in `.env` (sonst landen sie im obersten Bereich)
- **Log-Channel für geschlossene Tickets:** `LOG_CHANNEL_ID` in `.env` (optional)

## ➕ Später: Weitere Commands hinzufügen

Einfach eine neue Datei in `commands/` anlegen nach dem Muster von `setupTickets.js`,
dann `node deploy-commands.js` erneut ausführen.
