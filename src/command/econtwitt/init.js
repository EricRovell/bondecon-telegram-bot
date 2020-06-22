import econtwittCreate from "./create.js";
import econtwittFind from "./find.js";
import econtwittUpload from "./upload.js";
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
    const message = [
      "<b>Econtwitts</b> are short and concise public messages.\n\n",
      "Econtwitt's schema consists of:\n\n",
      "- <i>Message</i>: plain text,\n",
      "- <i>Date</i> of creation (can be set custom),\n",
      "- <i>Language</i> of the message (RU and EN available),\n",
      "- <i>Keywords</i> assosiated with the message.\n\n",
      "At your disposal the power of:\n\n",
      "- <b>Creating</b> new messages\n",
      "- Making a <b>search</b> against your records to <b>edit</b> or <b>delete</b> them.\n\n",
      "If you do not need the power right now, cancel the invocation, please. Thank you."
    ].join("");

    const inlineOptions = [
      [
        [ "\u{1F4DD} Create", "create" ],
        [ "\u{1F4DD} Create from file", "upload" ],
        [ "\u{1F50D} Find", "find" ],
        [ "\u{1F50D} Cancel", "cancel" ]
      ]
    ];

    const { message_id } = await this.bot.sendMessage(this.chatID, message, {
      parse_mode: "HTML",
      ...inlineKeyboard(inlineOptions)
    });
    
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
      case "upload":
        this.upload(); break;
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

  upload() {
    new econtwittUpload({
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