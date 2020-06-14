import inlineKeyboard from "../util/inlineKeyword.js";

export default async function question({ bot, chatID, message, options }) {
  const { message_id: questionID } = await bot.sendMessage(chatID, message, {
    ...inlineKeyboard(options)
  });

  const reply = await new Promise(resolve => {
    bot.on("callback_query", async callbackQuery => {
      const { command } = JSON.parse(callbackQuery.data);
      resolve(command); 
    });
  });

  await bot.deleteMessage(chatID, questionID);
  return reply;
}
