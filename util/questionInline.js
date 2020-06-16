import inlineKeyboard from "../util/inlineKeyword.js";

export default async function question({ bot, chatID, messageID, message, options }) {

  // await for callback reply
  async function callbackReply() {
    return await new Promise(resolve => {
      bot.on("callback_query", callbackQuery => {
        const { command } = JSON.parse(callbackQuery.data);
        /* bot.answerCallbackQuery(callbackQuery.id, {
          text: "The language has been selected"
        }); */
        resolve(command);
      });
    });
  }

  // if messageID is provided, this message is edited to make up a question
  if (messageID) {
    await bot.editMessageText(message, {
      message_id: messageID,
      chat_id: chatID,
      ...inlineKeyboard(options)
    });

    return await callbackReply();
  }

  // no messageID -> completely new message for question, deleted afterwards
  const { message_id: questionID } = await bot.sendMessage(chatID, message, {
    ...inlineKeyboard(options)
  });

  const reply = await callbackReply();
  await bot.deleteMessage(chatID, questionID);
  return reply;
}
