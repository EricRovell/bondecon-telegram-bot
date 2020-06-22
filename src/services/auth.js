import question from "../../util/question.js";

export default class Auth {
  #secret;

  constructor({ bot, dbClient, userID, chatID }) {
    this.bot = bot;
    this.dbClient = dbClient;

    this.userID = userID;
    this.chatID = chatID;
    this.#secret = null;
    this.permission = false;
  }

  async login() {
    // check by userID
    await this.auth();
    // userID check failed -> ask the secret
    if (!this.permission) {
      await this.askSecret();
      await this.validateUser();
    }
  }

  async auth() {
    // check by userID
    const db = await this.dbClient.connect();
    const user = await db
      .collection("users")
      .findOne({ userID: this.userID }, { name: 1 });

    if (user) {
      this.bot.sendMessage(this.chatID, `Always glad to see you, ${user.name}! How can I help?\n\n/econtwitt`);
      this.permission = true;
    }
  }

  async askSecret() {
    this.#secret = await question({
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
        secret: this.#secret
      }, {
        $set: { userID: this.userID }
      });

    if (user.value) {
      this.permission = true;
      this.bot.sendMessage(this.chatID, `It is nice to see you, \u{2605}${user.value.name}!\n\n/econtwitt`);
    } else {
      this.bot.sendMessage(this.chatID, "Sorry, I do not recognize you...");
    }
  }

  static async getAllowedIDs(dbClient) {
    const db = await dbClient.connect();
    return await db
      .collection("users")
      .find(
        { userID: { $exists: true }},
        { projection: { userID: 1, _id: 0 }}
      ).toArray();
  }
}
