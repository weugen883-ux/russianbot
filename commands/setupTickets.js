// commands/setupTickets.js
// Слэш-команда для публикации панели тикетов в текущем канале
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { buildTicketPanel } = require("../utils/buildTicketPanel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-tickets")
    .setDescription("Опубликовать панель тикетов со всеми категориями в этом канале")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const { embeds, components } = buildTicketPanel();

    // Отправляем панель в канал (не как ответ, чтобы не было упоминания команды)
    await interaction.channel.send({ embeds, components });

    // Личное подтверждение для администратора
    await interaction.reply({
      content: "✅ Панель тикетов успешно опубликована.",
      ephemeral: true,
    });
  },
};
