require('dotenv').config();
const { toggleDoor, resetFeeders } = require('../mauzis/petcare');
const logger = require('../logger');
const commands = new Map();
const { Telegraf } = require('telegraf');



function iniTelegramBot() {
    commands.set("zue", setDoorState);
    commands.set("uf", setDoorState);
    commands.set("links", setResetFeeders)
    commands.set("rechts", setResetFeeders)
    commands.set("alle", setResetFeeders)
        // Create a bot that uses 'polling' to fetch new updates
    const bot = new Telegraf(process.env.BOT_ID);
    bot.launch();

    // Listen for any kind of message. There are different kinds of
    // messages.
    bot.on('text', async(ctx) => {
        let answer = "";
        let text = ctx.message.text.toLocaleLowerCase();
        try {
            let foo = commands.get(text);
            answer = await foo(text);
            ctx.reply(answer);
        } catch (e) {
            let commandsList = "";
            commands.forEach((val, key) => {
                commandsList = commandsList + `${key}\n`
            });
            ctx.reply(`${text} isch ke befehl, benutz:\n${commandsList}`);
        }
    });

}

async function setDoorState(msg) {
    logger.info(`${msg === "zue" ? 'lock' : 'unlock'} door`);
    let res = await toggleDoor(msg === "zue" ? 1 : 0);
    return Array.isArray(res.results) ? "ok 😊" : res.results ? `isch dänk scho ${msg}😝` : "öpis isch nid guet😑"
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