import Econtwitt from "../Econtwitt.js";

export default class EcontwittFind {
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
    const { message_id: questionID } = await this.bot.sendMessage(this.chatID, "Please, provide an ID:", {
      reply_markup: { "force_reply": true }
    });
    let { text, message_id: replyID } = await new Promise(resolve => {
      this.bot.onReplyToMessage(this.chatID, questionID, resolve);
    });

    this.econtwittID = text;
    await this.bot.deleteMessage(this.chatID, questionID);
    await this.bot.deleteMessage(this.chatID, replyID);
  }

  async queryDB() {
    const db = await this.dbClient.connect();

    try {
      const result = await db
        .collection("blog.econtwitts")
        .findOne({ _id: this.dbClient.ID(this.econtwittID) });
      
      if (result) {
        const econtwitt = new Econtwitt(result);
        await this.bot.sendMessage(this.chatID, econtwitt.render,
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
