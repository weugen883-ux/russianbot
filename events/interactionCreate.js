// events/interactionCreate.js
// Обрабатывает все взаимодействия: слэш-команды и нажатия кнопок
const { createTicketChannel } = require("../utils/createTicket");
const { closeTicketChannel } = require("../utils/closeTicket");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {

    // --- Слэш-команды ---
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`Ошибка при выполнении команды ${interaction.commandName}:`, err);
        const errorReply = {
          content: "❌ При выполнении команды произошла ошибка.",
          ephemeral: true,
        };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorReply);
        } else {
          await interaction.reply(errorReply);
        }
      }
      return;
    }

    // --- Кнопки ---
    if (interaction.isButton()) {
      const { customId } = interaction;

      // Создание тикета: ticket_create_<typeId>
      if (customId.startsWith("ticket_create_")) {
        const typeId = customId.replace("ticket_create_", "");
        return createTicketChannel(interaction, typeId);
      }

      // Закрытие тикета: ticket_close_<typeId>_<ownerId>
      if (customId.startsWith("ticket_close_")) {
        const rest = customId.replace("ticket_close_", "");
        const lastUnderscore = rest.lastIndexOf("_");
        const typeId = rest.slice(0, lastUnderscore);
        const ownerId = rest.slice(lastUnderscore + 1);
        return closeTicketChannel(interaction, typeId, ownerId);
      }
    }
  },
};
