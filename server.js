// server.js
// Lokaler Konfigurations-Server: hostet die HTML-Oberfläche und schreibt
// direkt in config/ticketTypes.js wenn Änderungen gespeichert werden.
// Starten mit: node server.js

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const CONFIG_PATH = path.join(__dirname, "config", "ticketTypes.js");
const HTML_PATH = path.join(__dirname, "konfigurator.html");

// Sicherstellen, dass config/ existiert
if (!fs.existsSync(path.join(__dirname, "config"))) {
  fs.mkdirSync(path.join(__dirname, "config"));
}

const server = http.createServer((req, res) => {
  // CORS-Header damit Browser keine Probleme macht
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // GET / → HTML-Seite ausliefern
  if (req.method === "GET" && req.url === "/") {
    try {
      const html = fs.readFileSync(HTML_PATH, "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (e) {
      res.writeHead(500);
      return res.end("konfigurator.html nicht gefunden.");
    }
  }

  // GET /load → aktuelle ticketTypes.js laden und als JSON zurückgeben
  if (req.method === "GET" && req.url === "/load") {
    try {
      const content = fs.readFileSync(CONFIG_PATH, "utf8");
      // Tickets aus der Datei parsen
      const match = content.match(/const TICKET_TYPES = \[([\s\S]*?)\];/);
      if (!match) throw new Error("Format nicht erkannt");

      // Einzelne Felder per Regex extrahieren
      const entries = [];
      const entryPattern = /\{([\s\S]*?)\}/g;
      let m;
      while ((m = entryPattern.exec(match[1])) !== null) {
        const block = m[1];
        const get = (key) => {
          const r = new RegExp(`${key}:\\s*"([^"]*)"`) ;
          const found = block.match(r);
          return found ? found[1] : "";
        };
        const styleMatch = block.match(/style:\s*(ButtonStyle\.\w+)/);
        const styleMap = {
          "ButtonStyle.Primary": "blurple",
          "ButtonStyle.Secondary": "grey",
          "ButtonStyle.Success": "green",
          "ButtonStyle.Danger": "red",
        };
        entries.push({
          id: get("id"),
          label: get("label"),
          emoji: get("emoji"),
          color: styleMap[styleMatch?.[1]] || "blurple",
          prefix: get("channelPrefix"),
        });
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: true, tickets: entries }));
    } catch (e) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  }

  // POST /save → neue ticketTypes.js schreiben
  if (req.method === "POST" && req.url === "/save") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { tickets } = JSON.parse(body);
        if (!Array.isArray(tickets) || tickets.length === 0) {
          throw new Error("Keine Tickets übergeben");
        }

        const styleMap = {
          blurple: "ButtonStyle.Primary",
          grey: "ButtonStyle.Secondary",
          green: "ButtonStyle.Success",
          red: "ButtonStyle.Danger",
        };

        function slugify(text, fallback) {
          const s = (text || "")
            .toLowerCase()
            .replace(/[^a-z0-9]/gi, "")
            .replace(/[\u0400-\u04FF]/g, "")
            .slice(0, 16);
          return s || fallback;
        }

        function makeId(t, i) {
          const base = slugify(t.prefix || t.label, "ticket" + (i + 1));
          return base + "_" + (i + 1);
        }

        const now = new Date().toLocaleDateString("de-DE");
        const entries = tickets
          .map((t, i) => {
            const id = makeId(t, i);
            const prefix = slugify(t.prefix || t.label, id);
            return `  {
    id: "${id}",
    label: "${(t.label || "").replace(/"/g, '\\"')}",
    buttonLabel: "Создать тикет",
    emoji: "${(t.emoji || "📩").replace(/"/g, '\\"')}",
    style: ${styleMap[t.color] || "ButtonStyle.Primary"},
    channelPrefix: "${prefix}",
    description: "Тикет создан по причине: **${(t.label || "").replace(/"/g, '\\"')}**.",
  }`;
          })
          .join(",\n");

        const fileContent = `// config/ticketTypes.js
// Автоматически сгенерировано Конфигуратором тикетов ${now}
// Изменения вносятся через konfigurator.html — не редактируйте вручную

const { ButtonStyle } = require("discord.js");

const TICKET_TYPES = [
${entries}
];

module.exports = { TICKET_TYPES };
`;

        fs.writeFileSync(CONFIG_PATH, fileContent, "utf8");
        console.log(`[${new Date().toLocaleTimeString("de-DE")}] ✅ ticketTypes.js aktualisiert (${tickets.length} Kategorien)`);

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error("Fehler beim Speichern:", e.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // Alles andere → 404
  res.writeHead(404);
  res.end("Nicht gefunden");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     Ticket-Konfigurator gestartet      ║");
  console.log(`║  → http://localhost:${PORT}              ║`);
  console.log("║  Strg+C zum Beenden                    ║");
  console.log("╚════════════════════════════════════════╝");
});
