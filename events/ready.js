// events/ready.js
// Срабатывает один раз при успешном запуске и авторизации бота
module.exports = {
  name: "clientReady",
  once: true,
  execute(client) {
    console.log(`✅ Бот запущен как ${client.user.tag}`);
    console.log(`📊 Активен на ${client.guilds.cache.size} сервере(ах)`);
  },
};
