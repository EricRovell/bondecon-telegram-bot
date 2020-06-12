export default function inlineKeyboard(options) {

  return {
    reply_markup: {
      inline_keyboard: [
        options.map(option => ({
          text: option.text,
          callback_data: JSON.stringify({
            "command": option.command,
            "value": option.value
          })
        }))
      ]
    }
  };
}
