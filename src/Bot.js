import TelegramBot from "node-telegram-bot-api";
import Auth from "./services/auth.js";

import EcontwittCommand from "./command/econtwitt/init.js";

export default class Bot {
  #allowedChatIDs;

  constructor({ token, dbClient }) {
    this.client = new TelegramBot(token, { polling: true });
    this.dbClient = dbClient;
    this.#allowedChatIDs = null;
  }

  async init() {
    // get allowed IDs from DB
    await this.getAllowedIDs();

    // polling errors
    this.client.on("polling_error", error => console.log(error));

    // start command init
    this.client.onText(/\/start/, async message => {
      
    });

    // login command init
    this.client.onText(/\/login/, async message => {
      const userID = message.from.id;
      const chatID = message.chat.id;

      const user = new Auth({
        userID,
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

  // getting allowed userIDs from DB which allowed to interact with bot
  // run once on bot start
  async getAllowedIDs() {
    const allowedIDs = await Auth.getAllowedIDs(this.dbClient);
    this.#allowedChatIDs = new Set(
      allowedIDs.map(({ userID }) => userID)
    );
  }

  // validate user by userID
  userValid(userID, chatID) {
    const check = this.#allowedChatIDs.has(userID);
    if (!check) {
      this.client.sendMessage(chatID, "Please, login: /login");
    }
    return check;
  }

  commandEcontwitt() {
    this.client.onText(/\/econtwitt/, async message => {
      const chatID = message.chat.id;
      const userID = message.from.id;
      
      if (!this.userValid(userID, chatID)) return;

      new EcontwittCommand({
        bot: this.client,
        dbClient: this.dbClient,
        chatID
      });
    });
  }

}
