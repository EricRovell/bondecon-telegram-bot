import TelegramBot from "node-telegram-bot-api";
import Auth from "./services/auth.js";

import EcontwittCommand from "./command/econtwitt/init.js";

export default class Bot {
  #allowedChatIDs;

  constructor({ token, dbClient }) {
    this.client = new TelegramBot(token, { polling: true });
    this.dbClient = dbClient;
    this.#allowedChatIDs = new Set();
  }

  async init() {
    this.client.on("polling_error", error => console.log(error));

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
      }
    });
  }

  commandEcontwitt() {
    this.client.onText(/\/econtwitt/, async message => {
      const chatID = message.chat.id;
      // validate chatID
      if (!this.#allowedChatIDs.has(chatID)) {
        this.client.sendMessage(chatID, "Please, login: type /start");
        return;
      };

      new EcontwittCommand({
        bot: this.client,
        dbClient: this.dbClient,
        chatID
      });
    });
  }

}
