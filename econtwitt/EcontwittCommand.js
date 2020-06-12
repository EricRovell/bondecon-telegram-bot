import econtwittCreate from "./dialogue/econtwittCreate.js";
import econtwittFind from "./dialogue/econtwittFind.js";

import inlineKeyboard from "../util/InlineKeyword.js";

export default class EcontwittCommand {
  constructor({ bot, dbClient, chatID }) {
    this.bot = bot;
    this.dbClient = dbClient;
  
    this.chatID = chatID;
    this.messageID;
    this.econtwitt;

    this.callbacks();
    this.message();
  }

  async message() {
    const message = "Create a new record or find records to work with them:";
    const inlineOptions = [
      { text: "\u{1F4DD} Create", "command": "create", value: "new" },
      { text: "\u{1F50D} Find", "command": "find", value: "find" },
    ];

    const { message_id } = await this.bot.sendMessage(this.chatID, message, inlineKeyboard(inlineOptions));
    this.messageID = message_id;
  }

  callbacks() {
    this.bot.on("callback_query", callbackQuery => {
      const { command } = JSON.parse(callbackQuery.data);

      if (command === "create") {
        new econtwittCreate({
          bot: this.bot,
          dbClient: this.dbClient,
          chatID: this.chatID
        });
      }

      if (command === "find") {
        const message = "Choose the criteria for a search:"
        const inlineOptions = [
          { text: "ID", "command": "create", value: "new" },
          { text: "Date", "command": "read", value: "read" },
          { text: "Language", "command": "create", value: "new" },
          { text: "Keywords", "command": "read", value: "read" },
        ];
        
        this.bot.editMessageText(message, {
          message_id: this.messageID,
          chat_id: this.chatID,
          ...inlineKeyboard(inlineOptions)
        });
        /* new econtwittFind({
          bot: this.bot,
          dbClient: this.dbClient,
          chatID: this.chatID
        }); */
      }

    });
    
  }

}