import inlineKeyboard from "../util/inlineKeyword.js";

export default class Viewer {
  constructor({ bot, dbClient, chatID, messageID = null, cursor, documents, Construct }) {
    this.bot = bot;
    this.dbClient = dbClient;
    this.chatID = chatID;
    this.messageID = messageID;

    this.currentIndex = 0;
    this.documents = documents;
    this.cursor = cursor;
    this.items = [];
    // Construct is the class to construct the document to the view
    // this Construct class should have render getter that returns HTML parsed message to view
    this.Construct = Construct;

    this.callback();
  }

  async getDocument() {
    // if already got this document from cursor
    if (this.items[this.currentIndex]) {
      return this.items[this.currentIndex];
    }

    // we didn't load this document -> get from cursor
    // we can go in incremental steps, means no jumps ahead (safe)
    const document = await this.cursor.next();
    if (document) {
      this.items.push(document);
      return document;
    }
  }

  async render() {
    const message = new this.Construct(await this.getDocument());

    if (this.messageID) {
      await this.bot.editMessageText(message.render, {
        message_id: this.messageID,
        chat_id: this.chatID,
        parse_mode: "HTML",
        ...inlineKeyboard([
          [[ "\u{274C} Delete item", "delete" ], [ "\u{274C} End", "end" ]],
          [
            [ "\u{2B05}", "prev" ],
            [ `${this.currentIndex + 1} / ${this.documents}`, "next" ],
            [ "\u{27A1}", "next" ]
          ],
        ])
      });

      return;
    }

    // not messageID provided -> generate new message
    const { message_id } = await this.bot.sendMessage(this.chatID, message.render, {
      parse_mode: "HTML",
      ...inlineKeyboard([
        [[ "\u{274C} Delete item", "delete" ]],
        [
          [ "\u{2B05}", "prev" ],
          [ `${this.currentIndex + 1} / ${this.documents}`, "next" ],
          [ "\u{27A1}", "next" ]
        ],
      ])
    });

    this.messageID = message_id;
  }

  async nextItem() {
    // increment if less than number of documents
    // else -> begin from the start (cycle)
    this.currentIndex = (this.currentIndex < this.documents - 1)
      ? this.currentIndex + 1
      : 0
    
    await this.render();
  }

  async prevItem() {
    // decrement if less than number of documents
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
    // cycle back only if the latest documents are fetched from cursor
    if (this.currentIndex === 0 && this.items[this.documents - 1]) {
      this.currentIndex = this.documents - 1;
    }
  
    await this.render();
  }

  async end() {
    this.callback(false);
    await this.bot.deleteMessage(this.chatID, this.messageID);
  }

  async deleteItem() {
    const db = await this.dbClient.connect();
    try {
      // delete item ->
      //  remove from items array ->
      //  switch view to the next ->
      //  if there was already one element -> close view
      await db
        .collection("blog.econtwitts")
        .deleteOne({
          _id: this.items[this.currentIndex]._id
        });
      
      if (this.items.length === 1) {
        await this.end();
        return;
      };
      this.items.splice(this.currentIndex, 1);
      this.documents--;
      this.nextItem();
      
    } catch (error) {
      console.log(error);
      this.bot.sendMessage(this.chatID, "Something is wrong...");
    }
  }

  callback(set = true) {
    if (!set) {
      this.bot.removeListener("callback_query");
      return;
    }

    this.bot.on("callback_query", async callbackQuery => {
      const { command } = JSON.parse(callbackQuery.data);
      switch(command) {
        case "prev":
          await this.prevItem(); break;
        case "next":
          await this.nextItem(); break;
        case "delete":
          await this.deleteItem(); break;
        case "end":
          await this.end(); break;
      }
    });
  }

}
