// deploy-commands.js
// Запускать один раз (или при каждом изменении команд),
// чтобы зарегистрировать слэш-команды в Discord.
require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

// Загружаем все команды из папки commands/
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log(`Регистрируем ${commands.length} команду(ы)...`);

    // Глобальная регистрация (может занять до 1 часа для полного распространения)
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`✅ Успешно зарегистрировано ${data.length} команду(ы).`);
  } catch (error) {
    console.error("Ошибка при регистрации команд:", error);
  }
})();
