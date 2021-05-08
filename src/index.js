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

bot.command('1', () => petcare.setDoorState('zue'));
bot.command('2', () => petcare.setDoorState('uf'));
bot.command('3', () => petcare.resetFeeders('links'));
bot.command('4', () => petcare.resetFeeders('rechts'));
bot.command('5', () => petcare.resetFeeders('alle'));
bot.command('6', () => petcare.getPetRport('status'));
bot.command('7', () => petcare.getDeviceRport('grät'));
bot.command('8', () => petcare.newPetPlace('pan dinne'));
bot.command('9', () => petcare.newPetPlace('pan dusse'));
bot.command('10', () => petcare.newPetPlace('nika dinne'));
bot.command('11', () => petcare.newPetPlace('nika dusse'));
bot.command('12', () => petcare.newPetPlace('minou dinne'));
bot.command('13', () => petcare.newPetPlace('minou dusse'));

/*
1 - Törli zue  
2 - Törli uf
3 - Aui Schäli links zrüg 
4 - Aui Schäli rechts zrüg 
5 - Aui schäli beidi site zrüg 
6 - Gib status 
7 - Batterie Grätlis
8 - Set Pan dinne
9 - Set Pan dusse
10 - Set Nika dinne
11 - Set Nika dusse
12 - Set Minou dinne
13 - Set Minou dusse
*/