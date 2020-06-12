export default class Auth {
  constructor({ bot, dbClient, chatID }) {
    this.bot = bot;
    this.dbClient = dbClient;

    this.chatID = chatID;
    this.user = null;
    this.password = null;
    this.permission = false;
  }

  async login() {
    await this.auth();
    if (!this.permission) {
      await this.askName();
      await this.askSecret();
      await this.validateUser();
    }
  }

  async auth() {
    // check the user by chatID first
    const db = await this.dbClient.connect();
    const user = await db
      .collection("users")
      .findOne({ chatID: this.chatID });

    if (user) {
      this.bot.sendMessage(this.chatID, `Always glad to see you, ${user.name}! How can I help?`);
      this.permission = true;
    }
  }

  async askName() {
    const question = "Hi there! What is your name, my friend?";
    const { message_id: questionID } = await this.bot.sendMessage(this.chatID, question, {
      reply_markup: { "force_reply": true }
    });
    let { text: reply, message_id: replyID } = await new Promise(resolve => {
      this.bot.onReplyToMessage(this.chatID, questionID, resolve);
    });

    this.user = reply;
    this.bot.deleteMessage(this.chatID, questionID);
    this.bot.deleteMessage(this.chatID, replyID);
  }

  async askSecret() {
    const question = "What is the secret?";
    const { message_id: questionID } = await this.bot.sendMessage(this.chatID, question, {
      reply_markup: { "force_reply": true }
    });
    let { text: reply, message_id: replyID } = await new Promise(resolve => {
      this.bot.onReplyToMessage(this.chatID, questionID, resolve);
    });

    this.password = reply;
    this.bot.deleteMessage(this.chatID, questionID);
    this.bot.deleteMessage(this.chatID, replyID);
  }

  async validateUser() {
    const db = await this.dbClient.connect();
    const user = await db
      .collection("users")
      .findOneAndUpdate({
        name: this.user,
        password: this.password
      }, {
        $set: { chatID: this.chatID }
      });

    if (user.value) {
      this.permission = true;
      this.bot.sendMessage(this.chatID, `It is nice to see you, ${user.value.name}!`);
    } else {
      this.bot.sendMessage(this.chatID, "Sorry, I do not recognize you...");
    }
  }
}
