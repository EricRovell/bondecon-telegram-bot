import TelegramBot from "node-telegram-bot-api";
import Auth from "./auth.js";

import EcontwittCommand from "./econtwitt/EcontwittCommand.js";

export default class Bot {
  #allowedChatIDs;

  constructor({ token, dbClient }) {
    this.client = new TelegramBot(token, { polling: true });
    this.dbClient = dbClient;
    this.#allowedChatIDs = new Set();
  }

  async init() {
    this.client.onText(/\/start/, async message => {
      const chatID = message.chat.id;

      const user = new Auth({
        chatID,
        bot: this.client,
        dbClient: this.dbClient
      });

      await user.login();
      if (user.permission) {
        this.#allowedChatIDs.add(chatID);
        // access to commands
        this.commandEcontwitt();
      }
    });
  }

  commandEcontwitt() {
    this.client.onText(/\/econtwitt/, async message => {
      const chatID = message.chat.id;
      /* if (!this.#allowedChatIDs.has(chatID)) {
        await this.client.sendMessage(chatID, "Please, log in.");
        return;
      }; */
      const command = new EcontwittCommand({
        bot: this.client,
        dbClient: this.dbClient,
        chatID
      });
      command.messageDefault;
    });
  }

}
