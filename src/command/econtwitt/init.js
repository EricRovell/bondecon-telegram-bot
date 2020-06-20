import econtwittCreate from "./create.js";
import econtwittFind from "./find.js";
import inlineKeyboard from "../../../util/InlineKeyword.js";

export default class EcontwittCommand {
  constructor({ bot, dbClient, chatID }) {
    this.bot = bot;
    this.dbClient = dbClient;
    this.chatID = chatID;
    this.messageID = null;
    this.econtwitt;

    this.message();
  }

  async message() {
    const message = "Create a new record or find records to work with them:";
    const inlineOptions = [
      [
        [ "\u{1F4DD} Create", "create" ],
        [ "\u{1F50D} Find", "find" ],
        [ "\u{1F50D} Cancel", "cancel" ]
      ]
    ];

    const { message_id } = await this.bot.sendMessage(this.chatID, message, inlineKeyboard(inlineOptions));
    this.messageID = message_id;

    let reply = await new Promise(resolve => {
      this.bot.on("callback_query", callbackQuery => {
        const { command } = JSON.parse(callbackQuery.data);
        resolve(command);  
      });
    });

    switch (reply) {
      case "create":
        this.create(); break;
      case "find":
        this.findOption(); break;
      case "cancel":
        this.finishDialogue(); break;
    }
  }

  create() {
    new econtwittCreate({
      bot: this.bot,
      dbClient: this.dbClient,
      chatID: this.chatID,
      messageID: this.messageID
    });
  }

  findOption() {
    new econtwittFind({
      bot: this.bot,
      dbClient: this.dbClient,
      chatID: this.chatID,
      messageID: this.messageID
    });
  }

  async finishDialogue() {
    await this.bot.deleteMessage(this.chatID, this.messageID);
  }

}