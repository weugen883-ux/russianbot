// utils/createTicket.js
// Основная логика создания тикет-каналов при нажатии на кнопку
const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { TICKET_TYPES } = require("../config/ticketTypes");

// Хранит информацию об открытых тикетах (typeId -> Set из userId)
// Предотвращает создание дублирующихся тикетов одного типа одним пользователем
const openTickets = new Map();

function hasOpenTicket(typeId, userId) {
  return openTickets.get(typeId)?.has(userId) ?? false;
}

function markTicketOpen(typeId, userId) {
  if (!openTickets.has(typeId)) openTickets.set(typeId, new Set());
  openTickets.get(typeId).add(userId);
}

function markTicketClosed(typeId, userId) {
  openTickets.get(typeId)?.delete(userId);
}

/**
 * Создаёт приватный тикет-канал для пользователя.
 * Доступ имеют ТОЛЬКО: создатель тикета, роль поддержки (SUPPORT_ROLE_ID) и бот.
 * Администраторы без роли поддержки доступа НЕ имеют.
 */
async function createTicketChannel(interaction, typeId) {
  const type = TICKET_TYPES.find((t) => t.id === typeId);
  if (!type) {
    return interaction.reply({
      content: "❌ Неизвестный тип тикета. Пожалуйста, свяжитесь с администратором.",
      ephemeral: true,
    });
  }

  const userId = interaction.user.id;

  // Проверяем, нет ли уже открытого тикета этого типа у пользователя
  if (hasOpenTicket(typeId, userId)) {
    return interaction.reply({
      content: "⚠️ У вас уже есть открытый тикет этой категории!",
      ephemeral: true,
    });
  }

  const guild = interaction.guild;
  const supportRoleId = process.env.SUPPORT_ROLE_ID;
  const categoryId = process.env.TICKET_CATEGORY_ID || null;

  // Формируем имя канала, например: "bug-username"
  const safeUsername = interaction.user.username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
  const channelName = `${type.channelPrefix}-${safeUsername || userId}`;

  // Настройки прав доступа — ТОЛЬКО нужные роли, без автоматических прав администраторов
  // Используем guild.id для @everyone вместо guild.roles.everyone.id (не требует кэша)
  const permissionOverwrites = [
    {
      // Все участники сервера по умолчанию не видят канал
      id: guild.id,
      deny: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      // Создатель тикета: может видеть, писать, читать историю и прикреплять файлы
      id: userId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
    {
      // Бот: полный доступ для управления каналом
      id: interaction.client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.EmbedLinks,
      ],
    },
  ];

  // Роль поддержки — добавляем только если задана в .env
  if (supportRoleId) {
    permissionOverwrites.push({
      id: supportRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    });
  } else {
    console.warn("⚠️ SUPPORT_ROLE_ID не задан в .env — тикеты будут видны только создателю и боту!");
  }

  let ticketChannel;
  try {
    ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId || undefined,
      permissionOverwrites,
      topic: `Тикет от ${interaction.user.tag} (${userId}) | Тип: ${type.id}`,
    });
  } catch (err) {
    console.error("Ошибка при создании тикет-канала:", err);
    return interaction.reply({
      content: "❌ Не удалось создать тикет. Проверьте, есть ли у бота право 'Управление каналами'.",
      ephemeral: true,
    });
  }

  markTicketOpen(typeId, userId);

  // Приветственное сообщение внутри тикет-канала
  const welcomeEmbed = new EmbedBuilder()
    .setTitle(`${type.emoji} ${type.label}`)
    .setDescription(
      `${type.description}\n\nПривет, <@${userId}>! Участник команды поддержки скоро ответит вам.\nПожалуйста, опишите вашу проблему как можно подробнее.`
    )
    .setColor(0x2b2d31)
    .setTimestamp();

  // Кнопка закрытия тикета
  const closeButton = new ButtonBuilder()
    .setCustomId(`ticket_close_${typeId}_${userId}`)
    .setLabel("Закрыть тикет")
    .setEmoji("🔒")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(closeButton);

  // Упоминаем создателя и роль поддержки
  const pingContent = supportRoleId
    ? `<@${userId}> <@&${supportRoleId}>`
    : `<@${userId}>`;

  await ticketChannel.send({
    content: pingContent,
    embeds: [welcomeEmbed],
    components: [row],
  });

  // Личное (ephemeral) подтверждение — видит только создатель
  await interaction.reply({
    content: `✅ Ваш тикет создан: ${ticketChannel}`,
    ephemeral: true,
  });
}

module.exports = {
  createTicketChannel,
  markTicketClosed,
};
