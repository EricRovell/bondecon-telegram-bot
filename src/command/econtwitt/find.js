import Conversation from "../../Conversation.js";
import Econtwitt from "../../records/econtwitt.js";
//import View from "../../src/View.js";
import ViewList from "../../ViewList.js";

export default class EcontwittFind extends Conversation {
  constructor({ bot, dbClient, chatID, messageID }) {
    super({ bot, dbClient, chatID, messageID });
    this.callbackID = null;
    this.query = {};
    this.searchResults = null;

    this.renderSurvey();
    this.queryDBCount();
    this.callback();
  }

  renderSurvey() {
    const message = [
      "Please, provide some information about your search:\n\n",
      "<pre><b>ID</b>: is the most specific search, you will get the results immediately,\n",
      "<b>Date</b>: Filter the results by exact day of the record was made as YYYY-MM-dd,\n",
      "<b>Language</b>: Filter the results by specified language,\n",
      "<b>Keywords</b>: Filter the results by associated keywords.</pre>\n\n",
      "After the information provided, you will see how many results you will get.\n\n",
    ].join("");

    const inlineOptions = [
      [
        [ "\u{2728} ID", "id" ],
        [ "\u{1F310} Language", "lang" ],
      ],
      [
        [ "\u{1F4C5} Date", "date" ],
        [ "\u{1F5DD} Keywords", "keywords" ]
      ],
      [
        [ "\u{274C} Cancel", "cancel" ],
        [ "\u{1F195} Reset all fields", "reset" ],
      ],
      [[ (this.searchResults) ? `\u{1F4E8} Show ${this.searchResults} records` : "\u{1F50D} Nothing yet...", "search" ]]
    ];
  
    this.bot.editMessageText(message, {
      message_id: this.messageID,
      chat_id: this.chatID,
      parse_mode: "HTML",
      ...Conversation.inlineKeyboard(inlineOptions)
    });
  }

  callback(set = true) {
    if (!set) {
      this.bot.removeListener("callback_query");
      return;
    }

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
          this.query = {};
          this.searchResults = 0;
          this.renderSurvey();
          break;
        case "search":
          this.queryDB(); break;
        default:
          break;
      }
    });
  }

  async finishDialogue() {
    this.callback(false);
    await this.bot.deleteMessage(this.chatID, this.messageID);
  }

  async askID() {
    const id = await this.question({
      message: "Please, provide an ID:"
    });

    this.bot.answerCallbackQuery(this.callbackID, {
      text: "Got an ID."
    });
    this.query._id = this.dbClient.ID(id);
    // providing ID is specific enough to get the result
    this.queryDB();
  }

  async askLang() {
    const reply = await this.questionInline({
      message: "Please, provide a language:",
      options: [
        [[ "Русский", "ru" ], [ "English", "en" ]]
      ]
    });

    this.bot.answerCallbackQuery(this.callbackID, {
      text: `Language set to ${reply}.`
    });
    this.query.lang = reply;

    // because this question overrides inline query, we reactivate current callback query listener
    this.queryDBCount();
    this.callback();
  }

  async askKeywords() {
    const reply = await this.question({
      message: "Please, provide keywords, separated by comma:"
    });

    // to select documents where all such keywords are present
    this.query.keywords = {
      $all: reply.split(",").map(keyword => keyword.trim().toLowerCase())
    };
    this.queryDBCount();
  }

  async askDate() {
    const reply = await this.question({
      message: "Please, provide a day date as YYYY-MM-DD:"
    });

    this.query.date = {
      $gte: new Date(new Date(reply).setHours(0, 0, 0)).toISOString(),
      $lt: new Date(new Date(reply).setHours(23, 59, 59)).toISOString()
    };
    this.queryDBCount();
  }

  async queryDB() {
    const db = await this.dbClient.connect();

    try {
      const result = await db
        .collection("blog.econtwitts")
        .find({ ...this.query });

      if (result) {
        await this.renderView(result)
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

  async queryDBCount() {
    const db = await this.dbClient.connect();

    try {
      this.searchResults = await db
        .collection("blog.econtwitts")
        .countDocuments({ ...this.query });
      
    } catch (error) {
      console.log(error);
      this.bot.sendMessage(this.chatID, "Something is wrong...");
    }

    this.renderSurvey();
  }

  async renderView(result) {
    this.callback(false);

    const view = new ViewList({
      bot: this.bot,
      dbClient: this.dbClient,
      chatID: this.chatID,
      messageID: this.messageID,
      cursor: result,
      Construct: Econtwitt
    });

    view.render();
  }

}
