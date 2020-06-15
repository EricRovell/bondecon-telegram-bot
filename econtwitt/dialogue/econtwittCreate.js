import Econtwitt from "../Econtwitt.js";
import EcontwittMessage from "../EcontwittMessage.js";
import inlineKeyboard from "../../util/inlineKeyword.js";
import question from "../../util/question.js";
import questionInline from "../../util/questionInline.js";


export default class EcontwittCreate {
  constructor({ bot, dbClient, chatID, messageID }) {
    this.bot = bot;
    this.dbClient = dbClient;
    this.chatID = chatID;
    this.messageID = messageID;
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
    this.econtwitt.lang = await questionInline({
      bot: this.bot,
      chatID: this.chatID,
      message: "Please, select a language:",
      messageID: this.messageID,
      options: [
        [[ "Русский", "ru" ], [ "English", "en" ]],
      ]
    });
  }

  async askDate() {
    const reply = await questionInline({
      bot: this.bot,
      chatID: this.chatID,
      message: "What timestamp should the message have?",
      messageID: this.messageID,
      options: [
        [[ "Now", "now" ], [ "Custom", "custom" ]],
      ]
    });

    if (reply === "custom") {
      this.econtwitt.date = await question({
        bot: this.bot,
        chatID: this.chatID,
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
    this.econtwitt.body = await question({
      bot: this.bot,
      chatID: this.chatID,
      message: "Please, provide a message:"
    });
  }

  async askKeywords() {
    this.econtwitt.keywords = await question({
      bot: this.bot,
      chatID: this.chatID,
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
