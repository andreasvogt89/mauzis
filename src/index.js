const logger = require('./logger');
const PetCare = require('./mauzis/PetCare');
const { Telegraf } = require('telegraf');
require('dotenv').config();

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

const commands = new Map();
commands.set("zue", (text) => petcare.setDoorState(text));
commands.set("uf", (text) => petcare.setDoorState(text));
commands.set("links", (text) => petcare.resetFeeders(text));
commands.set("rechts", (text) => petcare.resetFeeders(text));
commands.set("alle", (text) => petcare.resetFeeders(text));
commands.set("status", (text) => petcare.getRport(text));
commands.set("pan dinne", (text) => petcare.newPetPlace(text));
commands.set("pan dusse", (text) => petcare.newPetPlace(text));
commands.set("nika dinne", (text) => petcare.newPetPlace(text));
commands.set("nika dusse", (text) => petcare.newPetPlace(text));
commands.set("minou dinne", (text) => petcare.newPetPlace(text));
commands.set("minou dusse", (text) => petcare.newPetPlace(text));

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

bot.on('error', (err) => {
    logger.error(err);
});