class ConversationAddEcontwitt {
  constructor(bot) {
    this.bot = bot;
    this.lang = null;
    this.body = null;
    this.keywords = [];
  }

  init() {
    this.bot.onText(/\/add_econtwitt/, async (message, match) => {
      this.askLang();
    });
  }

  askLang() {
    bot.sendMessage(message.chat.id, "Please, choose a language:", {
      reply_markup: {
        "keyboard": [ ["ru"], ["en"] ]
      }
    });
  }

  getLang() {
    bot.onText(/\/echo (.+)/, async (message, match) => {
      const { id } = message.chat;
      const echo = match[1];
    
      bot.sendMessage(
        id,
        `~${echo}~`,
        { parse_mode: "MarkdownV2" }
      );
    
      /* bot.sendMessage(message.chat.id, "Welcome", {
        reply_markup: {
          "keyboard": [[ "Sample text", "Second sample" ], [ "Keyboard" ], [ "I am a robot" ]]
        }
      }) */
    });
  }

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
}