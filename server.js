import dotenv from "dotenv";
import DBClient from "./db.js";
import Bot from "./bot.js";

import ConversationAddEcontwitt from "./econtwitt/addEcontwitt.js";
import ConversationGetEcontwitt from "./econtwitt/getEcontwitt.js";

dotenv.config();


const telegramBot = new Bot({
  token: process.env.TOKEN,
  dbClient: new DBClient({
    url: process.env.DB_URL,
    dbName: process.env.DB_NAME
  })
});

telegramBot.init();

telegramBot.client.onText(/\/econtwitt (.+)/, async (message, match) => {
  const chatID = message.chat.id;
  const command = match[1];
  
  switch(command) {
    case "add": {
      new ConversationAddEcontwitt({
        bot: telegramBot.client,
        dbClient: telegramBot.dbClient,
        chatID
      });
      break;
    }
    case "read": {
      new ConversationGetEcontwitt({
        bot: telegramBot.client,
        dbClient: telegramBot.dbClient,
        chatID
      });
      break;
    }
  }
});
