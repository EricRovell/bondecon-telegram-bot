import inlineKeyboard from "../util/inlineKeyword.js";

export default class EcontwittMessage {
  constructor({ bot, dbClient, chatID, messageID = null, econtwitt }) {
    this.bot = bot;
    this.dbClient = dbClient;
    this.chatID = chatID;
    this.messageID = messageID;
    this.econtwitt = econtwitt;
  }

  async render() {
    this.bot.editMessageText(this.econtwitt.render, {
      message_id: this.messageID,
      chat_id: this.chatID,
      parse_mode: "HTML",
      ...inlineKeyboard([
        [[ "\u{274C} Delete", "delete" ],
        [ "\u{1F527} Edit", "edit" ]]
      ])
    });

    let reply = await new Promise(resolve => {
      this.bot.on("callback_query", callbackQuery => {
        const { command } = JSON.parse(callbackQuery.data);
        if (command === "delete") {
          this.bot.answerCallbackQuery(callbackQuery.id, {
            text: "The message was deleted."
          });
        }
        resolve(command);
      });
    });

    switch(reply) {
      case "delete":
        await this.delete(); break;
      case "edit":
        await this.edit(); break;
    }
  }

  async delete() {
    const db = await this.dbClient.connect();

    try {
      await db
        .collection("blog.econtwitts")
        .deleteOne({ _id: this.econtwitt.id });
      await this.bot.deleteMessage(this.chatID, this.messageID);
    } catch (error) {
      console.log(error);
      this.bot.sendMessage(this.chatID, "Something is wrong...");
    }
  }

  async edit() {
    console.log(12);
  }

}