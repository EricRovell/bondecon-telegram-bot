export default class Auth {
  constructor({ bot, dbClient, chatID }) {
    this.bot = bot;
    this.dbClient = dbClient;

    this.chatID = chatID;
    this.user = null;
    this.password = null;
    this.permission = false;
  }

  async auth() {
    // check the user by chatID first
    const db = await this.dbClient.connect();
    const user = await db
      .collection("users")
      .findOne({ chatID: this.chatID });

    if (user) {
      this.bot.sendMessage(this.chatID, "Glad to see you!");
      this.permission = true;
      return this.permission;
    }

    await this.askLogin(); 
  }

  async askLogin() {
    const { message_id } = await this.bot.sendMessage(this.chatID, "Hi there! What is your name, my friend?", {
      reply_markup: {
        "force_reply": true
      }
    });

    const listener = this.bot.onReplyToMessage(this.chatID, message_id, (message) => {
      this.user = message.text;
      this.bot.removeReplyListener(listener);
      this.askPass();
    });
  }

  async askPass() {
    const { message_id } = await this.bot.sendMessage(this.chatID, "What is the secret?", {
      reply_markup: {
        "force_reply": true
      }
    });

    const listener = this.bot.onReplyToMessage(this.chatID, message_id, async (message) => {
      this.password = message.text;
      this.bot.removeReplyListener(listener);
      this.authUser();
    });
  }

  async authUser() {
    const db = await this.dbClient.connect();
    const user = await db
      .collection("users")
      .findOneAndUpdate({
        user: this.user,
        password: this.password
      }, {
        $set: { chatID: this.chatID }
      });

    if (user) {
      this.permission = true;
      this.bot.sendMessage(this.chatID, "It is nice to see you!");
    } else {
      this.bot.sendMessage(this.chatID, "Sorry, I do not recognize you...");
    }
  }

}
