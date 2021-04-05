require('dotenv').config();
const { toggleDoor, resetFeeders } = require('../mauzis/petcare');
const logger = require('../logger');
const commands = new Map();
const { Telegraf } = require('telegraf');
const Household = require('../mauzis/Household');


function iniTelegramBot() {
    const houshold = new Household();
    commands.set("zue", setDoorState);
    commands.set("uf", setDoorState);
    commands.set("links", setResetFeeders)
    commands.set("rechts", setResetFeeders)
    commands.set("alle", setResetFeeders)
    commands.set("status", houshold.getReport);
    const bot = new Telegraf(process.env.BOT_ID);
    bot.launch();
    bot.on('text', async(ctx) => {
        let answer = "";
        let text = ctx.message.text.toLocaleLowerCase();
        try {
            answer = await commands.get(text)(text);
            ctx.reply(answer);
        } catch (e) {
            logger.error("command error" + e);
            let commandsList = "";
            commands.forEach((val, key) => {
                commandsList = commandsList + `${key}\n`
            });
            ctx.reply(`${text} isch ke befehl, benutz:\n${commandsList}`);
        }
    });
    setInterval(async() => {
        let mes = await houshold.getUpdates();
        mes.forEach(message => {
            logger.info(message);
            bot.telegram.sendMessage(process.env.CHAT_ID, message);
        });
    }, 3000);
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