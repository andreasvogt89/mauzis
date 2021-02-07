require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_ID;
const { toggleDoor } = require('../mauzis/petcare');
const logger = require('../logs/logger');

function iniTelegramBot() {

    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, { polling: true });

    bot.on('polling_error', (error) => {
        logger.error("Bot is invalid" + error);
        bot.stopPolling();
    });

    // Matches "/echo [whatever]"
    bot.onText(/\/echo (.+)/, (msg, match) => {
        // 'msg' is the received Message from Telegram
        // 'match' is the result of executing the regexp above on the text content
        // of the message

        const chatId = msg.chat.id;
        const resp = match[1]; // the captured "whatever"

        // send back the matched "whatever" to the chat
        bot.sendMessage(chatId, resp);
    });

    // Listen for any kind of message. There are different kinds of
    // messages.
    bot.on('message', async(msg) => {
        const chatId = msg.chat.id;
        if (msg.text.toLocaleLowerCase() === "zue") {
            logger.info('lock door');
            let res = await toggleDoor(1);
            if (Array.isArray(res.results)) {
                bot.sendMessage(chatId, "ok 😊");
            } else if (res.results) {
                bot.sendMessage(chatId, "isch dänk scho zue😝")
            } else {
                bot.sendMessage(chatId, "öpis isch nid guet😑")
            };
        } else if (msg.text.toLocaleLowerCase() === "uf") {
            logger.info('unlock door');
            let res = await toggleDoor(0);
            if (Array.isArray(res.results)) {
                bot.sendMessage(chatId, "ok 😊");
            } else if (res.results) {
                bot.sendMessage(chatId, "isch dänk scho offe😝")
            } else {
                bot.sendMessage(chatId, "öpis isch nid guet😑")
            };
        } else {
            bot.sendMessage(chatId, "Benutz:" + "\n" +
                "uf oder zue");
        }
    });

}
module.exports = {
    iniTelegramBot
}