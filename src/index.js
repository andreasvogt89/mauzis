const logger = require('./logger');
const PetCare = require('./mauzis/PetCare');
const { Telegraf } = require('telegraf');
const PetUtilities = require('./mauzis/PetUtilities');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_ID);
bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

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

bot.command('1', (ctx) => auth(ctx, () => petcare.setDoorState('Mauzis Welt', PetUtilities.doorCommands.CLOSE)));
bot.command('2', (ctx) => auth(ctx, () => petcare.setDoorState('Mauzis Welt', PetUtilities.doorCommands.OPEN)));
bot.command('3', (ctx) => auth(ctx, () => petcare.getPetRport()));
bot.command('4', (ctx) => auth(ctx, () => petcare.getDeviceRport()));
bot.command('5', (ctx) => auth(ctx, () => petcare.setPetPlace('Bijou', PetUtilities.petPlaceCommands.INSIDE)));
bot.command('6', (ctx) => auth(ctx, () => petcare.setPetPlace('Bijou', PetUtilities.petPlaceCommands.OUTSIDE)));
bot.command('7', (ctx) => auth(ctx, () => petcare.setPetPlace('Louis', PetUtilities.petPlaceCommands.INSIDE)));
bot.command('8', (ctx) => auth(ctx, () => petcare.setPetPlace('Louis', PetUtilities.petPlaceCommands.OUTSIDE)));


//basic security 
const auth = (ctx, command) => {
    if (Array.from(process.env.USERIDS.split(",")).includes(ctx.update.message.from.id.toString())) {
        command();
    } else {
        ctx.reply("You are not authorized!")
    }
}

/*
1 - Törli zue  
2 - Törli uf
3 - Gib status 
4 - Batterie Grätlis
5 - Set Bijou dinne
6 - Set Bijou dusse
7 - Set Louis dinne
8 - Set Louis dusse
*/