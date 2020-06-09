import TelegramBot from "node-telegram-bot-api";
import Auth from "./auth.js";

import ConversationAddEcontwitt from "./econtwitt/addEcontwitt.js";

export default class Bot {
  constructor({ token, dbClient }) {
    this.client = new TelegramBot(token, { polling: true });
    this.dbClient = dbClient;
    this.allowedChatIDs = new Set();

    
  }

  async init() {
    this.client.onText(/\/start/, async message => {
      const chatID = message.chat.id;

      const user = new Auth({
        chatID,
        bot: this.client,
        dbClient: this.dbClient
      });

      const permission = await user.auth();
      if (permission) {
        this.allowedChatIDs.add(chatID);
      }
    });

  }

  //const addEcontwitt = new ConversationAddEcontwitt(telegramBot.client, dbClient);
  //addEcontwitt.init();

}

/* bot.onText(/\/gettwitt (.+)/, async (message, match) => {
  const { id } = message.chat;
  const twittID = match[1];

  console.log(twittID);

  const db = await client.connect();
  const twitt = await db
    .collection("blog.econtwitts")
    .findOne({ _id: ObjectID(twittID) });

  bot.sendMessage(id, `Hello! Here is the data: ${JSON.stringify(twitt, null, 2)}`);
}); */
