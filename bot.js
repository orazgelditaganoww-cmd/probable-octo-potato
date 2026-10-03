const TelegramBot = require('node-telegram-bot-api');

// BotFather'dan alınan Token:
const TOKEN = '8893301924:AAFF_3fE957DVkGpSri0kY82mYpFQIhEWjs'; 

// Sizin Telegram ID'niz:
const ADMIN_ID = 6455266137; 

const bot = new TelegramBot(TOKEN, { polling: true });
const approvedUsers = new Set([ADMIN_ID]); 

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name || '';
  const lastName = msg.from.last_name || '';
  const username = msg.from.username ? `@${msg.from.username}` : 'Yok';

  if (approvedUsers.has(userId)) {
    return bot.sendMessage(chatId, `Hoş geldiniz ${firstName}! VIP Terminal hazır:`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⚡ VIP Terminali Aç", web_app: { url: "https://probable-octo-potato-ivory.vercel.app" } }]
        ]
      }
    });
  }

  bot.sendMessage(chatId, "🔒 **Erişim Korumalı Bot**\n\nKatılım talebiniz yöneticiye iletildi. Onay bekleniyor...");

  const adminMessage = `🆕 **Yeni Katılım Talebi!**\n\n` +
                       `👤 **Ad:** ${firstName} ${lastName}\n` +
                       `🆔 **ID:** \`${userId}\`\n` +
                       `🌐 **Kullanıcı Adı:** ${username}`;

  bot.sendMessage(ADMIN_ID, adminMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Onayla", callback_data: `approve_${userId}` },
          { text: "❌ Reddet", callback_data: `reject_${userId}` }
        ]
      ]
    }
  });
});

bot.on('callback_query', (query) => {
  const data = query.data;
  const adminChatId = query.message.chat.id;

  if (query.from.id !== ADMIN_ID) return;

  if (data.startsWith('approve_')) {
    const userIdToApprove = parseInt(data.split('_')[1]);
    approvedUsers.add(userIdToApprove);

    bot.editMessageText(`✅ **Kullanıcı Onaylandı!** (ID: ${userIdToApprove})`, {
      chat_id: adminChatId,
      message_id: query.message.message_id
    });

    bot.sendMessage(userIdToApprove, "🎉 **Erişiminiz Onaylandı!**\n\nAşağıdaki butondan VIP Terminali açabilirsiniz:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⚡ VIP Terminali Aç", web_app: { url: "https://probable-octo-potato-ivory.vercel.app" } }]
        ]
      }
    });
  } else if (data.startsWith('reject_')) {
    const userIdToReject = parseInt(data.split('_')[1]);

    bot.editMessageText(`❌ **Kullanıcı Reddedildi.** (ID: ${userIdToReject})`, {
      chat_id: adminChatId,
      message_id: query.message.message_id
    });

    bot.sendMessage(userIdToReject, "❌ Üzgünüz, katılım talebiniz reddedildi.");
  }
});
