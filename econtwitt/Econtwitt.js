export default class Econtwitt {
  #_id;
  #lang;
  #body;
  #keywords;

  constructor({ id, lang, body, keywords } = {}) {
    this.#_id = id;
    this.#lang = lang;
    this.#body = body;
    this.#keywords = keywords;
  }

  set id(id) {
    this.#_id = id;
  }

  set lang(lang) {
    const ru = new Set([ "ru", "RU", "Russian", "русский", "Русский"]);
    const en = new Set([ "en", "EN", "Enslish", "english", "Английский", "eng", "ENG" ]);
    if (en.has(lang)) {
      this.#lang = lang;
      return;
    }
    if (ru.has(lang)) {
      this.#lang = lang;
      return;
    };
    throw new ValueError("Language should russian or english.");
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

  get asObject() {
    return {
      id: this.#_id,
      lang: this.#lang,
      body: this.#body,
      keywords: this.#keywords
    };
  }

  get render() {
    const renderID = `<b>ID: ${this.#_id}</b>`;
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
