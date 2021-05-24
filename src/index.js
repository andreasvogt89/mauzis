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
bot.command('3', (ctx) => auth(ctx, () => petcare.resetFeeders('links')));
bot.command('4', (ctx) => auth(ctx, () => petcare.resetFeeders('rechts')));
bot.command('5', (ctx) => auth(ctx, () => petcare.resetFeeders('alle')));
bot.command('6', (ctx) => auth(ctx, () => petcare.getPetRport()));
bot.command('7', (ctx) => auth(ctx, () => {
    petcare.getDeviceRport();
    require('./tractive-hook')((res) => {
        if (res) {
            /*Temp Mapping*/
            let map = {
                "TKJHLTXY": "Minou",
                "TLCEWOPY": "Pan",
                "TWCAHAFR": "Nika",
            }
            bot.telegram.sendMessage(process.env.CHAT_ID, res.reduce((acc, val) => {
                return `${acc}${map[val.tracker]}: ${val.battery}\n`
            }, "Trackers\n***************************\n"));
        } else {
            logger.error(`Tractive Error; ${res}`)
        }
    });
}));
bot.command('8', (ctx) => auth(ctx, () => petcare.setPetPlace('Pan', PetUtilities.petPlaceCommands.INSIDE)));
bot.command('9', (ctx) => auth(ctx, () => petcare.setPetPlace('Pan', PetUtilities.petPlaceCommands.OUTSIDE)));
bot.command('10', (ctx) => auth(ctx, () => petcare.setPetPlace('Nika', PetUtilities.petPlaceCommands.INSIDE)));
bot.command('11', (ctx) => auth(ctx, () => petcare.setPetPlace('Nika', PetUtilities.petPlaceCommands.OUTSIDE)));
bot.command('12', (ctx) => auth(ctx, () => petcare.setPetPlace('Minou', PetUtilities.petPlaceCommands.INSIDE)));
bot.command('13', (ctx) => auth(ctx, () => petcare.setPetPlace('Minou', PetUtilities.petPlaceCommands.OUTSIDE)));

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