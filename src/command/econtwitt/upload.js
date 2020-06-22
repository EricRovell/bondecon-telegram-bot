import Conversation from "../../Conversation.js";
import Econtwitt from "../../records/econtwitt.js";
import https from "https";

export default class EcontwittUpload extends Conversation {
  constructor({ bot, dbClient, chatID, messageID }) {
    super({ bot, dbClient, chatID, messageID });
    this.econtwitt;

    this.renderSurvey();
    this.readFile();
    this.callback();
  }

  get options() {
    return [
      [[ "\u{1F310} Upload", "read" ]],
    ];
  }

  renderSurvey() {
    const message = [
      "Let's construct a new record!\n",
      "Provide me some information, please:\n\n",
      "<pre>",
      "\u{2605} <b>Language</b>: Defaults to russian;\n",
      "\u{2605} <b>Date</b>: Defaults to the present moment;\n",
      "\u{2605} <b>Message</b>: the message itself!;\n",
      "\u{2605} <b>Keywords</b>: not required, but are really usefull.",
      "</pre>\n\n",
      "While the information is provided, you will see the live preview of the message.\n\n",
    ].join("");
  
    this.bot.editMessageText(message, {
      message_id: this.messageID,
      chat_id: this.chatID,
      parse_mode: "HTML",
      ...EcontwittUpload.inlineKeyboard(this.options)
    });
  }

  callback(set = true) {
    if (!set) {
      this.bot.removeListener("callback_query");
      return;
    }

    this.bot.on("callback_query", async callbackQuery => {
      const { command } = JSON.parse(callbackQuery.data);
      this.callbackID = callbackQuery.id;

      switch(command) {
        case "read":
          this.readFile(); break;
        case "upload":
          if (this.upload()) {
            this.bot.answerCallbackQuery(callbackQuery.id, {
              text: "Record uploaded successfuly!"
            })
          }
          break;
        default:
          break;
      }
    });
  }

  async readFile() {
    await this.bot.sendMessage(this.chatID, "Please, send a file...");

    const data = await new Promise(resolve => {
      this.bot.on("document", async message => {
        const fileID = message.document.file_id;
        const { file_path } = await this.bot.getFile(fileID);
        
        let data = "";
  
        https.get(`https://api.telegram.org/file/bot${process.env.TOKEN}/${file_path}`, response => {
          //console.log(response);
          response.on("data", chunk => data += chunk);
          response.on("end", () => resolve(data));
        });
      });
    });

    this.econtwitt = Econtwitt.fromTextFile(data);
    await this.upload();
  }

  async upload() {
    const db = await this.dbClient.connect();

    try {
      const { insertedId } = await db
        .collection("blog.econtwitts")
        .insertOne(this.econtwitt.asObject);

      if (insertedId) {
        return true;
      }

    } catch (error) {
      console.log(error);
      this.bot.sendMessage(this.chatID, "Something is wrong...");
    }
  }

}
