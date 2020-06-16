export default class Conversation {
  constructor({ bot, dbClient, chatID, messageID = null }) {
    this.bot = bot;
    this.dbClient = dbClient;
    this.chatID = chatID;
    this.messageID = messageID;
  }

  async question({ message }) {
    const { message_id: questionID } = await this.bot.sendMessage(this.chatID, message, {
      reply_markup: { "force_reply": true }
    });
    const { text, message_id: replyID } = await new Promise(resolve => {
      this.bot.onReplyToMessage(this.chatID, questionID, resolve);
    });
  
    await this.bot.deleteMessage(this.chatID, questionID);
    await this.bot.deleteMessage(this.chatID, replyID);
    return text;
  }

  async questionInline({ message, options }) {
    // await for callback reply
    const callbackReply = async () => {
      return await new Promise(resolve => {  
        const listener = this.bot.on("callback_query", callbackQuery => {
          const { command } = JSON.parse(callbackQuery.data);
          /* bot.answerCallbackQuery(callbackQuery.id, {
            text: "The language has been selected"
          }); */
          this.bot.removeListener("callback_query", listener);
          resolve(command);
        });
      });
    }

    // if messageID is provided, this message is edited to make up a question
    if (this.messageID) {
      await this.bot.editMessageText(message, {
        message_id: this.messageID,
        chat_id: this.chatID,
        ...Conversation.inlineKeyboard(options)
      });
      return await callbackReply();
    }

    // no messageID -> completely new message for question, deleted afterwards
    const { message_id: questionID } = await this.bot.sendMessage(this.chatID, message, {
      ...Conversation.inlineKeyboard(options)
    });

    const reply = await callbackReply();
    await this.bot.deleteMessage(chatID, questionID);
    return reply;
  }


  static inlineKeyboard(options, reply) {
    const inlineButton = data => {
      const [ text, command ] = data;
      return {
        "text": text,
        callback_data: JSON.stringify({ command })
      }
    };
  
    function inlineButtons(options) {
      return options.map(option => {
        if (option.every(value => typeof value === "string")) {
          return inlineButton(option);
        } else {
          return inlineButtons(option);
        }
      });
    }
  
    return {
      reply_markup: {
        ...(reply ? { "force_reply": true } : []),
        inline_keyboard: inlineButtons(options)
      }
    };
  }

}
