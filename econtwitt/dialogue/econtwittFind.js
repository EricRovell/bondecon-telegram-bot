import Econtwitt from "../Econtwitt.js";
import Viewer from "../../src/Viewer.js";
import inlineKeyboard from "../../util/inlineKeyword.js";
import question from "../../util/question.js";
import questionInline from "../../util/questionInline.js";

export default class EcontwittFind {
  constructor({ bot, dbClient, chatID, messageID }) {
    this.bot = bot;
    this.dbClient = dbClient;
    this.chatID = chatID;
    this.messageID = messageID;
    this.callbackID = null;
    this.query = {};

    this.init();
  }

  init() {
    const message = "Please, provide some information:"
    const inlineOptions = [
      [
        [ "\u{1F4C5} Date", "date" ],
        [ "\u{1F310} Language", "lang" ],
        [ "\u{1F5DD} Keywords", "keywords" ]
      ],
      [[ "\u{2728} ID", "id" ]],
      [
        [ "\u{274C} Cancel", "cancel" ],
        [ "\u{1F195} Reset", "reset" ],
        [ "\u{1F50D} Search", "search" ]
      ]
    ];
  
    this.bot.editMessageText(message, {
      message_id: this.messageID,
      chat_id: this.chatID,
      ...inlineKeyboard(inlineOptions)
    });

    this.bot.on("callback_query", async callbackQuery => {
      const { command } = JSON.parse(callbackQuery.data);
      this.callbackID = callbackQuery.id;

      switch(command) {
        case "id":
          this.askID(); break;
        case "date":
          this.askDate(); break;
        case "lang":
          this.askLang(); break;
        case "keywords":
          this.askKeywords(); break;
        case "cancel":
          this.finishDialogue(); break;
        case "reset":
          this.query = {}; break;
        case "search":
          this.queryDB(); break;
      }
    });
  }

  async finishDialogue() {
    this.bot.removeListener("callback_query");
    await this.bot.deleteMessage(this.chatID, this.messageID);
  }

  async askID() {
    const id = await question({
      bot: this.bot,
      chatID: this.chatID,
      message: "Please, provide an ID:"
    });

    this.bot.answerCallbackQuery(this.callbackID, {
      text: "Got an ID."
    });
    this.query._id = this.dbClient.ID(id);
  }

  async askLang() {
    const reply = await questionInline({
      bot: this.bot,
      chatID: this.chatID,
      message: "Please, provide an ID:",
      options: [
        [[ "Русский", "ru" ], [ "English", "en" ]]
      ]
    });

    this.bot.answerCallbackQuery(this.callbackID, {
      text: `Language set to ${reply}.`
    });
    this.query.lang = reply;
  }

  async askKeywords() {
    const reply = await question({
      bot: this.bot,
      chatID: this.chatID,
      message: "Please, provide keywords, separated by comma:"
    });

    // to select documents where all such keywords are present
    this.query.keywords = {
      $all: reply.split(",").map(keyword => keyword.trim().toLowerCase())
    };
  }

  async askDate() {
    const reply = await question({
      bot: this.bot,
      chatID: this.chatID,
      message: "Please, provide a day date as YYYY-MM-DD:"
    });

    this.query.date = {
      $gte: new Date(new Date(reply).setHours(0, 0, 0)).toISOString(),
      $lt: new Date(new Date(reply).setHours(23, 59, 59)).toISOString()
    };
  }

  async queryDB() {
    const db = await this.dbClient.connect();

    try {
      const result = await db
        .collection("blog.econtwitts")
        .find({ ...this.query });
      
      if (result) {
        const view = new Viewer({
          bot: this.bot,
          dbClient: this.dbClient,
          chatID: this.chatID,
          messageID: this.messageID,
          cursor: result,
          documents: await result.count(),
          Construct: Econtwitt
        });

        view.render();
      } else {
        await this.bot.answerCallbackQuery(this.callbackID, {
          text: "Nothing has been found..."
        });
      }
      
    } catch (error) {
      console.log(error);
      this.bot.sendMessage(this.chatID, "Something is wrong...");
    }
  }  
}
