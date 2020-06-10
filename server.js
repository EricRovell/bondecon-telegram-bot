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

telegramBot.client.onText(/\/econtwitt (.+)/, async (message, match) => {
  const chatID = message.chat.id;
  const command = match[1];
  
  switch(command) {
    case "add": {
      // ask a language
      const { message_id: langMessage } = await telegramBot.client.sendMessage(chatID, "Please, select a language:", {
        reply_markup: { "force_reply": true }
      });
      let replyLang = await new Promise(resolve => {
        telegramBot.client.onReplyToMessage(chatID, langMessage, resolve);
      });
      //await telegramBot.client.sendMessage(chatID, replyLang.text);
      // ask for a keywords
      const { message_id: keywordsMessage } = await telegramBot.client.sendMessage(chatID, "Please, provide keywords, separated by comma:", {
        reply_markup: { "force_reply": true }
      });
      let replyKeywords = await new Promise(resolve => {
        telegramBot.client.onReplyToMessage(chatID, keywordsMessage, resolve);
      });
      // ask for a body
      const { message_id: bodyMessage } = await telegramBot.client.sendMessage(chatID, "Please, provide the post body:", {
        reply_markup: { "force_reply": true }
      });
      let replyBody = await new Promise(resolve => {
        telegramBot.client.onReplyToMessage(chatID, bodyMessage, resolve);
      });
      const econtwitt = {
        lang: replyLang.text,
        keywords: replyKeywords.text,
        body: replyBody.text
      };
      console.log(econtwitt);
      //await telegramBot.client.sendMessage(chatID, reply.text);

      break;
    }
    case "read": {
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Русский",
                callback_data: JSON.stringify({
                  "command": "language",
                  "value": "ru"
                })
              },
              {
                text: "English",
                callback_data: JSON.stringify({
                  "command": "language",
                  "value": "en"
                })
              }
            ]
          ]
        }
      };
      // ask a language
      await telegramBot.client.sendMessage(chatID, "Please, select a language:", options);

      let replyLang = await new Promise(resolve => {
        telegramBot.client.on("callback_query", callbackQuery => {
          const { command, value } = JSON.parse(callbackQuery.data);
          if (command === "language") {
            telegramBot.client.answerCallbackQuery(callbackQuery.id);
            resolve(value);
          }
        });
      });
      break;
    }
  }
});


/* telegramBot.client.onText(/\/gettwitt (.+)/, async (message, match) => {
  const { id } = message.chat;
  const twittID = match[1];

  const db = await dbClient.connect();
  const twitt = await db
    .collection("blog.econtwitts")
    .findOne({ _id: ObjectID(twittID) });

    telegramBot.client.sendMessage(id, `Hello! Your twitt has an ID: ${twitt.insertedID}`);
}); */
