const logger = require('./logger');
const PetCare = require('./mauzis/PetCare');
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

commands.set("zue", (text) => { return petcare.setDoorState(text) });
commands.set("uf", (text) => { return petcare.setDoorState(text) });
/* 
commands.set("links", setResetFeeders)
commands.set("rechts", setResetFeeders)
commands.set("alle", setResetFeeders)*/
commands.set("status", (text) => { return petcare.getRport(text) });

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