export default class ConversationAddEcontwitt {
  constructor(bot, dbClient) {
    this.bot = bot;
    this.dbClient = dbClient;
    this.chatID = null;

    this.econtwitt = {
      lang: null,
      body: null,
      keywords: []
    };

    this.setCallbackQuery();
  }

  init() {
    this.bot.onText(/\/add_econtwitt/, async (message, match) => {
      this.chatID = message.chat.id;
      this.askLang();
    });
  }

  setCallbackQuery() {
    this.bot.on("callback_query", (callbackQuery) => {
      const data = JSON.parse(callbackQuery.data);
      const options = {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id
      };

      if (data.command === "language") {
        this.econtwitt.lang = data.value;
        this.bot.sendMessage(options.chat_id, "The language is chosen!");
        this.bot.answerCallbackQuery(callbackQuery.id);

        this.askKeywords(options);
      }
    });
  }

  askLang() {
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
    this.bot.sendMessage(this.chatID, "Please, choose a language:", options);    
  }

  async askKeywords() {
    const { message_id } = await this.bot.sendMessage(this.chatID, "Please, provide some keywords, separated by comma:", {
      reply_markup: {
        "force_reply": true
      }
    });

    const listener = this.bot.onReplyToMessage(this.chatID, message_id, (message) => {
      const { text } = message;
      this.econtwitt.keywords = text.split(",").map(keyword => keyword.trim());
      this.bot.removeReplyListener(listener);
      this.askBody();  
    });    
  }

  async askBody() {
    const { message_id } = await this.bot.sendMessage(this.chatID, "Please, provide the message:", {
      reply_markup: {
        "force_reply": true
      }
    });

    const listener = this.bot.onReplyToMessage(this.chatID, message_id, (message) => {
      const { text } = message;
      this.econtwitt.body = text;
      this.bot.removeReplyListener(listener);
      this.uploadData();
    });
  }

  async uploadData() {
    const db = await this.dbClient.connect();

    try {
      const econtwitt = await db
        .collection("blog.econtwitts")
        .insertOne(this.econtwitt);
      this.bot.sendMessage(this.chatID, `Uploaded successfully: ${JSON.stringify(econtwitt, null, 2)}`);
    } catch (error) {
      this.bot.sendMessage(this.chatID, "Something is wrong...");
    }

  }
  
}
