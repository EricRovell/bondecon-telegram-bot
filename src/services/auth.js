import question from "../../util/question.js";

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
      this.bot.sendMessage(this.chatID, `Always glad to see you, ${user.name}! How can I help?\n\n/econtwitt`);
      this.permission = true;
    }
  }

  async askName() {
    this.user = await question({
      bot: this.bot,
      chatID: this.chatID,
      message: "Hi there! What is your name, my friend?"
    });
  }

  async askSecret() {
    this.password = await question({
      bot: this.bot,
      chatID: this.chatID,
      message: "What is the secret?"
    });
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
      this.bot.sendMessage(this.chatID, `It is nice to see you, \u{2605}${user.value.name}!\n\n/econtwitt`);
    } else {
      this.bot.sendMessage(this.chatID, "Sorry, I do not recognize you...");
    }
  }
}
