const logger = require('./logger');
const PetCare = require('./mauzis/PetCare');
const { Telegraf } = require('telegraf');
const PetUtilities = require('./mauzis/PetUtilities');
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

bot.command('1', () => petcare.setDoorState('Küchenklappe', PetUtilities.doorCommands.CLOSE));
bot.command('2', () => petcare.setDoorState('Küchenklappe', PetUtilities.doorCommands.OPEN));
bot.command('3', () => petcare.resetFeeders('links'));
bot.command('4', () => petcare.resetFeeders('rechts'));
bot.command('5', () => petcare.resetFeeders('alle'));
bot.command('6', () => petcare.getPetRport());
bot.command('7', () => petcare.getDeviceRport());
bot.command('8', () => petcare.setPetPlace('Bijou', PetUtilities.petPlaceCommands.INSIDE));
bot.command('9', () => petcare.setPetPlace('Bijou', PetUtilities.petPlaceCommands.OUTSIDE));
bot.command('10', () => petcare.setPetPlace('Louis', PetUtilities.petPlaceCommands.INSIDE));
bot.command('11', () => petcare.setPetPlace('Louis', PetUtilities.petPlaceCommands.OUTSIDE));


/*
1 - Törli zue  
2 - Törli uf
3 - Aui Schäli links zrüg 
4 - Aui Schäli rechts zrüg 
5 - Aui schäli beidi site zrüg 
6 - Gib status 
7 - Batterie Grätlis
8 - Set Bijou dinne
9 - Set Bijou dusse
10 - Set Louis dinne
11 - Set Louis dusse

*/