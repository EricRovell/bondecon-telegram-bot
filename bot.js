import TelegramBot from "node-telegram-bot-api";

export default class Bot {
  constructor(token) {
    this.client = new TelegramBot(token, { polling: true });
  }

  init() {
    this.client.onText(/\/echo (.+)/, async (message, match) => {
      const { id } = message.chat;
      const echo = match[1];
    
      this.client.sendMessage(
        id,
        `~${echo}~`,
        { parse_mode: "MarkdownV2" }
      );

      this.client.sendMessage(id, "reply me :)", {
        reply_markup: {
          force_reply: true,
          keyboard: [ ["Русский", "English"] ]  
        }
      });
    });
  }

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

/* bot.onText(/\/econtwitt/, async (message, match) => {
  const { id } = message.chat;
  const twittID = match[1];

  // ask a language
  bot.sendMessage(message.chat.id, "Econtwitt's language:", {
    reply_markup: {
      "keyboard": [ ["ru"], ["en"] ]
    }
  });

  const db = await client.connect();
  const twitt = await db
    .collection("blog.econtwitts")
    .findOne({ _id: ObjectID(twittID) });

  bot.sendMessage(id, `Hello! Here is the data: ${JSON.stringify(twitt, null, 2)}`);
}); */