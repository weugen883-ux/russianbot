// utils/buildTicketPanel.js
// Формирует сообщение с панелью тикетов (эмбеды + кнопки) для отправки в канал
const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} = require("discord.js");
const { TICKET_TYPES } = require("../config/ticketTypes");

/**
 * Строит payload для панели тикетов.
 * Каждая категория получает отдельный эмбед и кнопку с названием категории.
 */
function buildTicketPanel() {
  const embeds = [];
  const components = [];

  for (const type of TICKET_TYPES) {
    // Пустой разделительный эмбед для визуального отступа
    embeds.push(
      new EmbedBuilder()
        .setDescription("\u200b")
        .setColor(0x2b2d31)
    );

    // Кнопка с названием категории вместо generic "Создать тикет"
    const button = new ButtonBuilder()
      .setCustomId(`ticket_create_${type.id}`)
      .setLabel(type.label.length > 80 ? type.label.slice(0, 77) + "..." : type.label)
      .setEmoji(type.emoji)
      .setStyle(type.style);

    components.push(new ActionRowBuilder().addComponents(button));
  }

  return { embeds, components };
}

module.exports = { buildTicketPanel };
