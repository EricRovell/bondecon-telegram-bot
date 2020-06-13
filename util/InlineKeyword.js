/* const options = [
  ["Text", "value"],
  [
    ["Text", "value"],
    ["Text", "value"],
    ["Text", "value"],
  ]
] */

function inlineButtons(options) {

  const inlineButton = data => {
    const [ text, command ] = data;
    return {
      "text": text,
      callback_data: JSON.stringify({ command })
    }
  };

  return options.map(option => {
    if (option.every(value => typeof value === "string")) {
      return inlineButton(option);
    } else {
      return inlineButtons(option);
    }
  });
}

export default function inlineKeyboard(options, reply) {
  return {
    reply_markup: {
      ...(reply ? { "force_reply": true } : []),
      inline_keyboard: inlineButtons(options)
    }
  };
}
