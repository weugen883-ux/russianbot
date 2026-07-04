// utils/closeTicket.js
// Логика закрытия тикета: подтверждение, лог и удаление канала
const { EmbedBuilder } = require("discord.js");
const { markTicketClosed } = require("./createTicket");

/**
 * Закрывает тикет: отправляет подтверждение, пишет в лог-канал (если настроен),
 * затем удаляет канал через 5 секунд.
 */
async function closeTicketChannel(interaction, typeId, ownerId) {
  await interaction.reply({
    content: "🔒 Тикет будет закрыт через 5 секунд...",
  });

  // Снимаем отметку об открытом тикете
  markTicketClosed(typeId, ownerId);

  // Если задан лог-канал — записываем информацию о закрытии
  const logChannelId = process.env.LOG_CHANNEL_ID;
  if (logChannelId) {
    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle("🔒 Тикет закрыт")
        .addFields(
          { name: "Канал", value: `#${interaction.channel.name}`, inline: true },
          { name: "Закрыл", value: `<@${interaction.user.id}>`, inline: true },
          { name: "Владелец тикета", value: `<@${ownerId}>`, inline: true }
        )
        .setColor(0xed4245)
        .setTimestamp();

      await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
    }
  }

  // Удаляем канал через 5 секунд
  setTimeout(async () => {
    try {
      await interaction.channel.delete();
    } catch (err) {
      console.error("Ошибка при удалении тикет-канала:", err);
    }
  }, 5000);
}

module.exports = { closeTicketChannel };
