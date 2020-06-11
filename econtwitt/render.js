export default function renderEcontwitt({ _id, body, keywords = [] }) {
  const parsedKeywords = keywords
    .map(keyword => `#${keyword.replace(/\s/g, "_")}`)
    .join(" ");

  return (`ID: <b>${_id}</b>\n\n<pre>${body}</pre>\n\n<i>${parsedKeywords}</i>`);
}
