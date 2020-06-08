import dotenv from "dotenv";
import { DBClient, ObjectID } from "./db.js";
import Bot from "./bot.js";

dotenv.config();

const telegramBot = new Bot(process.env.TOKEN);
const dbClient = new DBClient({
  url: process.env.DB_URL,
  dbName: process.env.DB_NAME
});

telegramBot.init();
dbClient.connect();

telegramBot.client.onText(/\/gettwitt (.+)/, async (message, match) => {
  const { id } = message.chat;
  const twittID = match[1];

  const db = await dbClient.connect();
  const twitt = await db
    .collection("blog.econtwitts")
    .findOne({ _id: ObjectID(twittID) });

    telegramBot.client.sendMessage(id, `Hello! Here is the data: ${JSON.stringify(twitt, null, 2)}`);
});
