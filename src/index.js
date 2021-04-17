const logger = require('./logger');
const PetCare = require('./mauzis/Petcare');
require('dotenv').config();
const commands = new Map();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_ID);
bot.launch();
const petcare = new PetCare();
petcare.start();


petcare.on("info", (info) => {
    logger.info(info);
});

petcare.on("error", (err) => {
    logger.error(err);
    bot.telegram.sendMessage(process.env.CHAT_ID, err);
});

petcare.on("message", (mes) => {
    logger.info(mes);
    bot.telegram.sendMessage(process.env.CHAT_ID, mes);
});

commands.set("zue", (text) => petcare.setDoorState(text));
commands.set("uf", (text) => petcare.setDoorState(text));
commands.set("links", (text) => petcare.resetFeeders(text));
commands.set("rechts", (text) => petcare.resetFeeders(text));
commands.set("alle", (text) => petcare.resetFeeders(text));
commands.set("status", (text) => { return petcare.getRport(text) });

bot.on('text', async(ctx) => {
    let text = ctx.message.text.toLocaleLowerCase();
    try {
        if (!text.startsWith('/')) {
            commands.get(text)(text);
        }
    } catch (e) {
        logger.error("command error" + e);
        let commandsList = "";
        commands.forEach((val, key) => {
            commandsList = commandsList + `${key}\n`
        });
        ctx.reply(`${text} isch ke befehl, benutz:\n${commandsList}`);
    }
});