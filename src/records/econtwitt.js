export default class Econtwitt {
  #_id;
  #lang;
  #date;
  #body;
  #keywords;

  constructor({
    id, _id,
    lang = "ru",
    date = new Date(),
    body = "Empty message. Probably, secret one.",
    keywords = [],
  } = {}) {
    this.#_id = id ?? _id;
    this.#lang = lang;
    this.#date = date;
    this.#body = body;
    this.#keywords = keywords;
  }

  set id(id) {
    this.#_id = id;
  }

  set lang(lang) {
    const ru = new Set([ "ru", "russian", "русский" ]);
    const en = new Set([ "en", "english", "английский", "eng" ]);
    if (en.has(lang.toLowerCase())) {
      this.#lang = lang;
      return;
    }
    if (ru.has(lang.toLowerCase())) {
      this.#lang = lang;
      return;
    };
    throw new ValueError("Language should russian or english.");
  }

  set date(date) {
    // Date now is default
    if (date.toLowerCase() === "now" || date === "") return;
    if (new Date(date) !== "Invalid Date") {
      this.#date = new Date(date);
    }
  }

  set body(body) {
    if (typeof body !== "string") {
      throw TypeError("Body of the massage should be a string.")
    }
    this.#body = body.trim();
  }

  set keywords(keywords) {
    if (typeof keywords === "string") {
      this.#keywords = [ ...keywords.split(",").map(keyword => keyword.trim().toLowerCase()) ];
      return;
    }
    if (Array.isArray(keywords)) {
      this.#keywords = keywords;
      return;
    };
    throw new TypeError("Keywords should be a string or an array.");
  }

  get id() {
    return this.#_id;
  }

  get asObject() {
    return {
      _id: this.#_id,
      lang: this.#lang,
      date: this.#date,
      body: this.#body,
      keywords: this.#keywords
    };
  }

  get render() {
    const date = `<pre>${this.#date.toLocaleString("ru")}</pre>\n`;
    const id = (this.#_id)
      ? `<b>ID: ${this.#_id}</b>\n\n`
      : "\n";
    const body = `<pre>${this.#body}</pre>\n\n`;
    const keywords = `<i>${
      this.#keywords
        .map(keyword => `#${keyword.replace(/\s/g, "_")}`)
        .join(" ")
    }</i>`;

    return [
      date,
      id,
      body,
      keywords
    ].join("");
  }

  static fromObject({ id, _id, lang, date = new Date, body, keywords = [] }) {
    const econtwitt = new Econtwitt();
    // using setters to edit data
    econtwitt.id = id ?? _id ?? null;
    econtwitt.lang = lang;
    econtwitt.date = date;
    econtwitt.body = body;
    econtwitt.keywords = keywords;

    return econtwitt;
  }

  static fromTextFile(textFileData) {
    try {
      const [ body, metadata ] = parseData(textFileData);
      
      return Econtwitt.fromObject({
        ...metadata,
        body
      });

    } catch (error) {
      console.log(error);
    }

    function parseData(data) {
      // will be storing raw metadata here
      const metadata = {};
      // cut data to get frontmatter and body
      const [ rawFrontmatter, body ] = data.split(/\-{3,}/, 2);
      const frontmatter = rawFrontmatter
        .split(/\r\n/)
        .filter(Boolean)
        .map(line => {
          // ! meta key:value, value should have whitespace after colon
          // ! possible split on date value as 2020-01-01T12:12 as it has colon too
          const [ param, value ] = line.split(/(?<=\D)\:(?=\D)/);
          metadata[param] = value.trim();
        });

      return [ body.trim(), metadata ];
    }
  }


}
