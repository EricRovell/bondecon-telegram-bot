// conversation super class
import Conversation from "../../src/Conversation.js";
// record constructors
import Econtwitt from "../Econtwitt.js";
import EcontwittMessage from "../EcontwittMessage.js";

export default class EcontwittCreate extends Conversation {
  constructor({ bot, dbClient, chatID, messageID }) {
    super({ bot, dbClient, chatID, messageID });
    this.econtwitt = new Econtwitt({
      id: new dbClient.ID()
    });
    // init the dialogue after creation
    this.doSurvey();
  }

  async doSurvey() {
    await this.askLang();
    await this.askDate();
    await this.askBody();
    await this.askKeywords();
    await this.uploadData();
  }

  async askLang() {
    this.econtwitt.lang = await this.questionInline({
      message: "Please, select a language:",
      options: [
        [[ "Русский", "ru" ], [ "English", "en" ]],
      ]
    });
  }

  async askDate() {
    const reply = await this.questionInline({
      message: "What timestamp should the message have?",
      options: [
        [[ "Now", "now" ], [ "Custom", "custom" ]],
      ]
    });

    if (reply === "custom") {
      this.econtwitt.date = await this.question({
        message: "Please, provide a date as YYYY-MM-DD:THH-MM-ss:"
      });
    }

    // later the user input should be text
    // it is not possible to edit messages without inline buttons
    await this.bot.editMessageText("Waiting...", {
      message_id: this.messageID,
      chat_id: this.chatID,
    });
  }

  async askBody() {
    this.econtwitt.body = await this.question({
      message: "Please, provide a message:"
    });
  }

  async askKeywords() {
    this.econtwitt.keywords = await this.question({
      message: "Please, provide keywords, separated by comma:"
    });
  }

  async uploadData() {
    const db = await this.dbClient.connect();

    try {
      await db
        .collection("blog.econtwitts")
        .insertOne(this.econtwitt.asObject);
      await this.renderMessage();
    } catch (error) {
      console.log(error);
      this.bot.sendMessage(this.chatID, "Something is wrong...");
    }
  }

  async renderMessage() {
    const message = new EcontwittMessage({
      bot: this.bot,
      dbClient: this.dbClient,
      chatID: this.chatID,
      messageID: this.messageID,
      econtwitt: this.econtwitt
    });
    message.render();
  }
  
}
