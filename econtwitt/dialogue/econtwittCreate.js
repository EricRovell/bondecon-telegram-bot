import Econtwitt from "../Econtwitt.js";
import EcontwittMessage from "../EcontwittMessage.js";
import inlineKeyboard from "../../util/inlineKeyword.js";
import question from "../../util/question.js";
import questionEdited from "../../util/questionEdited.js";

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
    this.bot.editMessageText("Please, select a language:", {
      message_id: this.messageID,
      chat_id: this.chatID,
      ...inlineKeyboard([
        [[ "Русский", "ru" ], [ "English", "en" ]],
      ])
    });

    this.econtwitt.lang = await new Promise(resolve => {
      this.bot.on("callback_query", callbackQuery => {
        const { command } = JSON.parse(callbackQuery.data);
        this.bot.answerCallbackQuery(callbackQuery.id, {
          text: "The language has been selected"
        });
        resolve(command);  
      });
    });
  }

  async askDate() {
    this.bot.editMessageText("What timestamp should the message have?", {
      message_id: this.messageID,
      chat_id: this.chatID,
      ...inlineKeyboard([
        [[ "Now", "now" ], [ "Custom", "custom" ]],
      ])
    });

    this.econtwitt.date = await new Promise(resolve => {
      this.bot.on("callback_query", async callbackQuery => {
        const { command } = JSON.parse(callbackQuery.data);
        let reply = "now";

        if (command === "now") {
          this.bot.answerCallbackQuery(callbackQuery.id, {
            text: "The date has been set to present."
          });
        }

        if (command === "custom") {
          reply = await question({
            bot: this.bot,
            chatID: this.chatID,
            message: "Please, provide a date as YYYY-MM-DD:THH-MM-ss:"
          });
        }

        resolve(reply);
      });
    });

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
