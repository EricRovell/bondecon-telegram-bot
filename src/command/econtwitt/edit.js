import Conversation from "../../Conversation.js";
import Econtwitt from "../../records/econtwitt.js";

export default class EcontwittEdit extends Conversation {
  constructor({ bot, dbClient, chatID, messageID, econtwitt }) {
    super({ bot, dbClient, chatID, messageID });
    this.econtwitt = new Econtwitt(econtwitt);

    this.renderSurvey();
    this.callback();
  }

  renderSurvey() {
    const inlineOptions = [
      [
        [ "\u{1F310} Body", "body" ],
        [ "\u{1F310} Language", "lang" ],
        [ "\u{1F4C5} Date", "date" ],
        [ "\u{1F5DD} Keywords", "keywords" ]
      ],
      [
        [ "\u{274C} Cancel", "cancel" ],
        [ "\u{1F4BE} Save edits", "save" ],
      ]
    ];
  
    this.bot.editMessageText(this.econtwitt.render, {
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

      switch(command) {
        case "body":
          this.askBody(); break;
        case "date":
          this.askDate(); break;
        case "lang":
          this.askLang(); break;
        case "keywords":
          this.askKeywords(); break;
        case "cancel":
          this.finishDialogue(); break;
        case "save":
          const result = this.queryDB();
          this.bot.answerCallbackQuery(callbackQuery.id, {
            text: (result) ? "Success" : "Something is wrong..."
          });
          break;
      }
    });
  }

  async finishDialogue() {
    this.callback(false);
    await this.bot.deleteMessage(this.chatID, this.messageID);
  }

  async askLang() {
    this.econtwitt.lang = await this.questionInline({
      message: "Please, provide a language:",
      options: [
        [[ "Русский", "ru" ], [ "English", "en" ]]
      ]
    });

    // because this question overrides inline query, we reactivate current callback query listener
    this.renderSurvey();
    this.callback();
  }

  async askKeywords() {
    this.econtwitt.keywords = await this.question({
      message: "Please, provide keywords, separated by comma:"
    });
    this.renderSurvey();
  }

  async askDate() {
    this.econtwitt.date = await this.question({
      message: "Please, provide a day date as YYYY-MM-DD:"
    });
    this.renderSurvey();
  }

  async askBody() {
    this.econtwitt.body = await this.question({
      message: "Please, provide a message:"
    });
    this.renderSurvey();
  }

  async queryDB() {
    const db = await this.dbClient.connect();

    try {
      // editing an ID is not an option,
      // so it is safe to find the record to update by ID
      const result = await db
        .collection("blog.econtwitts")
        .findOneAndUpdate({ _id: this.econtwitt.id }, {
          $set: this.econtwitt.asObject
        });

      if (result) {
        return true;
      }  
    } catch (error) {
      console.log(error);
      return false;
    }
  }

}
