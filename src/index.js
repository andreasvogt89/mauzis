const logger = require('./logger');
const PetCare = require('./mauzis/PetCare');
require('dotenv').config();
const commands = new Map();
const { Telegraf } = require('telegraf');
commands.set("zue", setDoorState);
commands.set("uf", setDoorState);
commands.set("links", setResetFeeders)
commands.set("rechts", setResetFeeders)
commands.set("alle", setResetFeeders)
commands.set("status", getRport);
const bot = new Telegraf(process.env.BOT_ID);
bot.launch();
const pc = new PetCare();
pc.start();


pc.on("start", (message) => {
    logger.info(message);
});

pc.on("error", (message) => {
    logger.error(message);
});

pc.on("message", (mes) => {
    bot.telegram.sendMessage(process.env.CHAT_ID, mes);
});

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

function getRport() {
    let mes = `${pc.household.name} isch ${pc.household.doorState}\n------------------------------`
    pc.household.pets.forEach(pet => {
        mes = `\n${mes}\n${pet.name} isch ${pet.place}\nwet im schäli: ${pet.curretWet}\ndry im  schäli: ${pet.curretWet}\n------------------------------`
    });
    return mes;
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