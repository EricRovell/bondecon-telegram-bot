export default async function question({ bot, chatID, message }) {
  const { message_id: questionID } = await bot.sendMessage(chatID, message, {
    reply_markup: { "force_reply": true }
  });
  let { text, message_id: replyID } = await new Promise(resolve => {
    bot.onReplyToMessage(chatID, questionID, resolve);
  });

  await bot.deleteMessage(chatID, questionID);
  await bot.deleteMessage(chatID, replyID);
  return text;
}
