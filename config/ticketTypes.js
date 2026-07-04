// config/ticketTypes.js
// Hier kannst du alle Ticket-Kategorien anpassen: Label, Style, Emoji, Channel-Präfix

const { ButtonStyle } = require("discord.js");

const TICKET_TYPES = [
  {
    id: "no_role",
    label: "Тикет если вы не получили роль",
    buttonLabel: "Создать тикет",
    emoji: "📩",
    style: ButtonStyle.Primary, // Blau
    channelPrefix: "role",
    description: "Тикет создан по причине: **не получена роль**.",
  },
  {
    id: "bug_report",
    label: "Тикет на репорт бага",
    buttonLabel: "Создать тикет",
    emoji: "📩",
    style: ButtonStyle.Secondary, // Grau
    channelPrefix: "bug",
    description: "Тикет создан по причине: **репорт бага**.",
  },
  {
    id: "moderator_report",
    label: "Тикет на репорт модератора",
    buttonLabel: "Создать тикет",
    emoji: "📩",
    style: ButtonStyle.Success, // Grün
    channelPrefix: "modreport",
    description: "Тикет создан по причине: **репорт модератора**.",
  },
  {
    id: "member_report",
    label: "Тикет на репорт участников",
    buttonLabel: "Создать тикет",
    emoji: "📩",
    style: ButtonStyle.Danger, // Rot
    channelPrefix: "report",
    description: "Тикет создан по причине: **репорт участника**.",
  },
];

module.exports = { TICKET_TYPES };
