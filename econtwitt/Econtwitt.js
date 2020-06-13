export default class Econtwitt {
  #_id;
  #lang;
  #date;
  #body;
  #keywords;

  constructor({ id, lang = "ru", date = new Date(), body, keywords = [] } = {}) {
    this.#_id = id;
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
    if (date.toLowerCase() === "now") return;
    if (new Date(date) !== "Invalid Date") {
      this.#date = new Date(date);
    }
  }

  set body(body) {
    if (typeof body !== "string") {
      throw TypeError("Body of the massage should be a string.")
    }
    this.#body = body;
  }

  set keywords(keywords) {
    if (typeof keywords === "string") {
      this.#keywords = [ ...keywords.split(",").map(keyword => keyword.trim()) ];
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
      date: this.#date.toISOString(),
      body: this.#body,
      keywords: this.#keywords
    };
  }

  get render() {
    const renderID = `<pre>${this.#date.toLocaleString("ru")}</pre>\n<b>ID: ${this.#_id}</b>`;
    const renderBody = `<pre>${this.#body}</pre>`;
    const renderKeywords = `<i>${
      this.#keywords
        .map(keyword => `#${keyword.replace(/\s/g, "_")}`)
        .join(" ")
    }</i>`;

    return [
      renderID,
      renderBody,
      renderKeywords
    ].join("\n\n");
  }
}
