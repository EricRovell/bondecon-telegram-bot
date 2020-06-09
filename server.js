import dotenv from "dotenv";
import { DBClient, ObjectID } from "./db.js";
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


/* telegramBot.client.onText(/\/gettwitt (.+)/, async (message, match) => {
  const { id } = message.chat;
  const twittID = match[1];

  const db = await dbClient.connect();
  const twitt = await db
    .collection("blog.econtwitts")
    .findOne({ _id: ObjectID(twittID) });

    telegramBot.client.sendMessage(id, `Hello! Your twitt has an ID: ${twitt.insertedID}`);
}); */
