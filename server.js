import dotenv from "dotenv";
import DBClient from "./db.js";
import Bot from "./bot.js";

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
