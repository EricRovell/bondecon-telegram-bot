import Conversation from "../../Conversation.js";
import Econtwitt from "../../records/econtwitt.js";

export default class EcontwittCreate extends Conversation {
  constructor({ bot, dbClient, chatID, messageID }) {
    super({ bot, dbClient, chatID, messageID });
    this.econtwitt = new Econtwitt();

    this.renderSurvey();
    this.callback();
  }

  get options() {
    return [
      [
        [ "\u{1F310} Language", "lang" ],
        [ "\u{1F4C4} Body", "body" ],
      ],
      [
        [ "\u{1F4C5} Date", "date" ],
        [ "\u{1F5DD} Keywords", "keywords" ]
      ],
      [[ "\u{274C} Cancel", "cancel" ]],
      [[ "\u{2601} Upload a record", "upload" ]]
    ];
  }

  renderSurvey() {
    const message = [
      "Let's construct a new record!\n",
      "Provide me some information, please:\n\n",
      "<pre>",
      "\u{2605} <b>Language</b>: Defaults to russian;\n",
      "\u{2605} <b>Date</b>: Defaults to the present moment;\n",
      "\u{2605} <b>Message</b>: the message itself!;\n",
      "\u{2605} <b>Keywords</b>: not required, but are really usefull.",
      "</pre>\n\n",
      "While the information is provided, you will see the live preview of the message.\n\n",
    ].join("");
  
    this.bot.editMessageText(message, {
      message_id: this.messageID,
      chat_id: this.chatID,
      parse_mode: "HTML",
      ...EcontwittCreate.inlineKeyboard(this.options)
    });
  }

  renderPreview({ options } = {}) {
    this.bot.editMessageText(this.econtwitt.render, {
      message_id: this.messageID,
      chat_id: this.chatID,
      parse_mode: "HTML",
      ...EcontwittCreate.inlineKeyboard(options ?? this.options)
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
        case "upload":
          if (this.upload()) {
            this.bot.answerCallbackQuery(callbackQuery.id, {
              text: "Record uploaded successfuly!"
            })
          }
          break;
        default:
          break;
      }
    });
  }

  async finishDialogue() {
    this.callback(false);
    await this.bot.deleteMessage(this.chatID, this.messageID);
  }

  async askBody() {
    this.econtwitt.body = await this.question({
      message: "Please, provide a message:"
    });
    this.renderPreview();
  }

  async askLang() {
    this.econtwitt.lang = await this.questionInline({
      message: "Please, provide a language:",
      options: [
        [[ "Русский", "ru" ], [ "English", "en" ]]
      ]
    });
    // because this question overrides inline query, we reactivate current callback query listener
    this.callback();
    this.renderSurvey();
  }

  async askKeywords() {
    this.econtwitt.keywords = await this.question({
      message: "Please, provide keywords, separated by comma:"
    });
    this.renderPreview();
  }

  async askDate() {
    this.econtwitt.date = await this.question({
      message: "Please, provide a day date as YYYY-MM-DD:"
    });
    this.renderPreview();
  }

  async upload() {
    const db = await this.dbClient.connect();

    try {
      const { insertedId } = await db
        .collection("blog.econtwitts")
        .insertOne(this.econtwitt.asObject);

      if (insertedId) {
        this.econtwitt.id = insertedId;
        this.renderPreview({ options: [] });
        return true;
      }

    } catch (error) {
      console.log(error);
      this.bot.sendMessage(this.chatID, "Something is wrong...");
    }
  }

}
