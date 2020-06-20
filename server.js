import dotenv from "dotenv";
import DBClient from "./src/services/db.js";
import Bot from "./src/bot.js";

dotenv.config();

const telegramBot = new Bot({
  token: process.env.TOKEN,
  dbClient: new DBClient({
    url: process.env.DB_URL,
    dbName: process.env.DB_NAME
  })
});

telegramBot.init();

// commands init
telegramBot.commandEcontwitt();
