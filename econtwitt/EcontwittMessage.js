export default class EcontwittMessage {
  constructor({ bot, dbClient, chatID, econtwitt }) {
    this.bot = bot;
    this.dbClient = dbClient;
    this.chatID = chatID;
    this.messageID = null;
    this.econtwitt = econtwitt;

    this.callbacks();

    this.options = [
      [
        {
          text: "\u{274C} Delete",
          callback_data: JSON.stringify({
            "command": "delete",
            "value": this.econtwitt.id
          })
        },
        {
          text: "\u{1F527} Update",
          callback_data: JSON.stringify({
            "command": "update",
            "value": null
          })
        }
      ]
    ]
  }

  async render() {
    const { message_id } = await this.bot.sendMessage(this.chatID, this.econtwitt.render, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: this.options
      }
    });

    this.messageID = message_id;
  }

  async callbacks() {
    this.bot.on("callback_query", async callbackQuery => {
      const { command, value } = JSON.parse(callbackQuery.data);

      if (command === "delete") {
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

        this.bot.answerCallbackQuery(callbackQuery.id, {
          text: "The message has been deleted."
        });
      }
    });
  }

} 