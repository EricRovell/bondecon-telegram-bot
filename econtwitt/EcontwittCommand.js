import econtwittCreate from "./dialogue/econtwittCreate.js";
import econtwittRead from "./dialogue/econtwittRead.js";

import inlineKeyboard from "../util/InlineKeyword.js";

export default class EcontwittCommand {
  constructor({ bot, dbClient, chatID }) {
    this.bot = bot;
    this.dbClient = dbClient;

    this.chatID = chatID;
    this.econtwitt;
    this.message;

    this.inlineOptions = [
      { text: "\u{1F4DD} Create", "command": "create", value: "new" },
      { text: "\u{1F4D6}	Read", "command": "read", value: "read" },
      { text: "\u{270D} Update", "command": "update", value: "update" },
      { text: "\u{1F5D1} Delete", "command": "delete", value: "delete" }
    ];

    this.callbacks();
  }

  get messageDefault() {
    const message = `Please, choose an option:\n\n<b>Create</b>: to make a new record;\n<b>Read</b>: to find a record;\n<b>Update</b>: to edit record;\n<b>Delete</b>: to delete a record permanently.`;
    this.bot.sendMessage(this.chatID, message, {
      parse_mode: "HTML",
      ...inlineKeyboard(this.inlineOptions)
    });
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

      if (command === "read") {
        new econtwittRead({
          bot: this.bot,
          dbClient: this.dbClient,
          chatID: this.chatID
        });
      }

    });
    
  }

}