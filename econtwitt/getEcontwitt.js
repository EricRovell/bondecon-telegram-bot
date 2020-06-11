import renderEcontwitt from "./render.js";

export default class ConversationAddEcontwitt {
  constructor({ bot, dbClient, chatID }) {
    this.bot = bot;
    this.dbClient = dbClient;
    this.chatID = chatID;
    this.econtwittID = null;

    this.doSurvey();
  }

  async doSurvey() {
    await this.askID();
    await this.queryDB();
  }  

  async askID() {
    const { message_id } = await this.bot.sendMessage(this.chatID, "Please, provide an ID:", {
      reply_markup: { "force_reply": true }
    });
    let { text } = await new Promise(resolve => {
      this.bot.onReplyToMessage(this.chatID, message_id, resolve);
    });

    this.econtwittID = text;
  }

  async queryDB() {
    const db = await this.dbClient.connect();

    try {
      const result = await db
        .collection("blog.econtwitts")
        .findOne({ _id: this.dbClient.ID(this.econtwittID) });
      
      if (result) {
        await this.bot.sendMessage(this.chatID, renderEcontwitt(result),
          { parse_mode: "HTML" }
        );
      } else {
        await this.bot.sendMessage(this.chatID, "Nothing has been found, sorry.");
      }
      
    } catch (error) {
      console.log(error);
      this.bot.sendMessage(this.chatID, "Something is wrong...");
    }
  }  
}
