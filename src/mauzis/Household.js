const { getState, getChronik } = require('./petcare');
const logger = require('../logger');
const { Console } = require('winston/lib/winston/transports');

class Household {

    constructor() {
        this.household = null;
        this.chronik = new Map();
        this.started_at = new Date().getTime();
    }

    async getUpdates() {
        let messages = []
        let newhoushold = await getState();
        let chronik = await getChronik();
        chronik.data.forEach(entry => {
            if (!this.chronik.has(entry.id) && new Date(entry.created_at).getTime() > this.started_at) {
                console.log("New chronik entry: " + entry.type);
                this.chronik.set(entry.id, entry);
                if (entry.type === 7) {
                    if (entry.movements[0].direction === 2) {
                        messages.push("Het äuä öper d Hang durs törli gha...")
                    } else {
                        messages.push("Es angers chätzli het id stube gluegt 😄")
                    }
                }
            }
        });
        if (this.household) {
            this.household.data.pets.forEach((pet, i) => {
                let newPlace = this.hasPlaceChanged(newhoushold.data.pets[i], pet);
                if (newPlace) {
                    messages.push(newPlace);
                }
                let eaten = this.hasEaten(newhoushold.data.pets[i], pet);
                console.log(eaten);
                logger.info(`Eat (${pet.name}): ${eaten} ${eaten.length}`);
                if (eaten.length > 0) {
                    messages.concat(eaten);
                }
            });
        }
        logger.info("Messages: " + messages);
        this.household = newhoushold;
        return messages;
    }

    hasPlaceChanged(pet, petBefore) {
            if (pet.status.activity.where !== petBefore.status.activity.where) {
                let place = pet.status.activity.where;
                return `${pet.name} ${place === 1 ? `is at home, Hello ${pet.name} 😍`: `went out, stay safe ❤`}`
        }
    }

    hasEaten(pet, petBefore){
        let feedings = []
        if (pet.status.feeding.change[0] !== petBefore.status.feeding.change[0]) {
            let ate = pet.status.feeding.change[0]
            feedings.push(`${pet.name} het ${ate}g trochnigs ghaberet`);
        }
        if (pet.status.feeding.change[1] !== petBefore.status.feeding.change[1]) {
            let ate = pet.status.feeding.change[1]
            feedings.push(`${pet.name} het ${ate}g nasses ghaberet`);
        }
        return feedings;
    }

    async getReport(msg){
        logger.info(`create ${msg} report`);
        let household = await getState();
        const door = household.data.devices[4].status.locking.mode;
        const pets = household.data.pets.map(pet=>{
            let place = pet.status.activity.where;
            return `${pet.name} ${place === 1 ? `is at home 😊`: `isch dusse 🧐`}` 
        }).join('\n');
        return `S törli isch ${door === 0 ? "offe" : "zue"}\n${pets}`
    }
}

module.exports = Household