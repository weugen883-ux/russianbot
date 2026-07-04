// index.js
// Точка входа — загружает команды, события и запускает бота
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,       // Доступ к серверам и каналам
    GatewayIntentBits.GuildMembers, // Доступ к информации об участниках
    GatewayIntentBits.GuildMessages, // Доступ к сообщениям
  ],
});

// --- Загрузка слэш-команд ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
  console.log(`📁 Команда загружена: ${command.data.name}`);
}

// --- Загрузка событий ---
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`⚡ Событие зарегистрировано: ${event.name}`);
}

// --- Глобальный перехват ошибок, чтобы бот не падал ---
process.on("unhandledRejection", (error) => {
  console.error("Необработанная ошибка (unhandledRejection):", error);
});

// --- Авторизация бота ---
client.login(process.env.DISCORD_BOT_TOKEN);
