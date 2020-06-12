import Econtwitt from "./Econtwitt.js";
import inlineKeyboard from "../util/InlineKeyword.js";

export default class ConversationAddEcontwitt {
  constructor({ bot, dbClient, chatID }) {
    this.bot = bot;
    this.dbClient = dbClient;
    this.chatID = chatID;
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
    const options = [
      { text: "Русский", command: "language", "value": "ru" },
      { text: "English", command: "language", "value": "en" }
    ];

    await this.bot.sendMessage(this.chatID, "Please, select a language:", inlineKeyboard(options));

    let replyLang = await new Promise(resolve => {
      this.bot.on("callback_query", callbackQuery => {
        const { command, value } = JSON.parse(callbackQuery.data);
        if (command === "language") {
          this.bot.answerCallbackQuery(callbackQuery.id, {
            text: "The language has been selected"
          });
          resolve(value);
        }
      });
    });

    this.econtwitt.lang = replyLang;
  }

  async askDate() {
    const options = [
      { text: "Now", command: "date", "value": "now" },
      { text: "Custom", command: "date", "value": "custom" }
    ];
    
    await this.bot.sendMessage(this.chatID, "What timestamp should the message have?", inlineKeyboard(options));

    let replyDate = await new Promise(resolve => {
      this.bot.on("callback_query", async callbackQuery => {
        const { value } = JSON.parse(callbackQuery.data);

        if (value === "now") {
          this.bot.answerCallbackQuery(callbackQuery.id, {
            text: "The date has been set to present."
          });
          resolve(value);
        }

        if (value === "custom") {
          const { message_id } = await this.bot.sendMessage(this.chatID, "Please, provide a date as YYYY-MM-DDThh-mm:", {
            reply_markup: { "force_reply": true }
          });
          let { text } = await new Promise(resolve => {
            this.bot.onReplyToMessage(this.chatID, message_id, resolve);
          });
          resolve(text);
        }
      });
    });

    this.econtwitt.date = replyDate;
  }

  async askBody() {
    const { message_id } = await this.bot.sendMessage(this.chatID, "Please, provide a message:", {
      reply_markup: { "force_reply": true }
    });
    let { text } = await new Promise(resolve => {
      this.bot.onReplyToMessage(this.chatID, message_id, resolve);
    });

    this.econtwitt.body = text;
  }

  async askKeywords() {
    const { message_id } = await this.bot.sendMessage(this.chatID, "Please, provide keywords, separated by comma:", {
      reply_markup: { "force_reply": true }
    });
    let { text } = await new Promise(resolve => {
      this.bot.onReplyToMessage(this.chatID, message_id, resolve);
    });

    this.econtwitt.keywords = text;
  }

  async uploadData() {
    const db = await this.dbClient.connect();
    console.log(this.econtwitt.asObject);

    try {
      await db
        .collection("blog.econtwitts")
        .insertOne(this.econtwitt.asObject);

      await this.bot.sendMessage(this.chatID, this.econtwitt.render,
        { parse_mode: "HTML" }
      );
    } catch (error) {
      console.log(error);
      this.bot.sendMessage(this.chatID, "Something is wrong...");
    }
  }
  
}
