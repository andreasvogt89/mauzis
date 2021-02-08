require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_ID;
const { toggleDoor, resetFeeders } = require('../mauzis/petcare');
const logger = require('../logger');
const commands = new Map();


function iniTelegramBot() {
    commands.set("zue", setDoorState);
    commands.set("uf", setDoorState);
    commands.set("links", setResetFeeders)
    commands.set("rechts", setResetFeeders)
    commands.set("alle", setResetFeeders)
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
        let answer = "";
        let text = msg.text.toLocaleLowerCase();
        try {
            let foo = commands.get(text);
            answer = await foo(text);
            bot.sendMessage(chatId, answer);
        } catch (e) {
            let commandsList = "";
            commands.forEach((val, key) => {
                commandsList = commandsList + `${key}\n`
            });
            bot.sendMessage(chatId, `${text} isch ke befehl, benutz:\n${commandsList}`);
        }
    });

}

async function setDoorState(msg) {
    let message = "";
    logger.info(`${msg === "zue" ? 'lock' : 'unlock'} door`);
    let res = await toggleDoor(msg === "zue" ? 1 : 0);
    if (Array.isArray(res.results)) {
        message = "ok 😊";
    } else if (res.results) {
        message = `isch dänk scho ${msg}😝`;
    } else {
        message = "öpis isch nid guet😑";
    };
    return message;
}

async function setResetFeeders(msg) {
    let message = "";
    logger.info(`reset feeders ${msg}`);
    let getTareVal = (msg) => {
        if (msg === 'links') {
            return 1
        } else if (msg === 'rechts') {
            return 2
        } else return 3
    }
    let res = await resetFeeders(getTareVal(msg));
    if (res.length > 0) {
        res.forEach(device => {
            message = message + `${device.bowl} ${device.result == 0 ? ' zrüggsetzt' : 'nid gange..' }` + "\n"
        });
    } else {
        message = "öpis isch nid guet😑";
    };
    return message;
}
module.exports = {
    iniTelegramBot
}