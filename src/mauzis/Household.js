const logger = require('../logger');
const PetCareAPI = require('./PetCareAPI');
const PetUtilities = require('./PetUtilities');
const EventEmitter = require('events');

class Household extends EventEmitter {

    constructor() {
        super();
        this.household = null;
        this.name = null;
        this.doorState = null;
        this.pets = new Map();
        this.chronik = new Map();
        this.started_at = new Date().getTime();
    }

    async inizialzie(loginData) {
        this.household = await PetCareAPI.getState(loginData);
        let chronik = await PetCareAPI.getChronik(loginData);
        let fillings = chronik.data.filter(entry => entry.type === 22);
        this.name = this.household.data.households[0].name;
        this.doorState = PetUtilities.getDoorState(this.household.data.devices[4].status.locking.mode);
        this.household.data.pets.forEach(pet => {
            let device = this.household.data.devices.find(device => device.id == pet.status.feeding.device_id);
            this.pets.set(pet.name, {
                name: pet.name,
                petID: pet.id,
                device: device.id,
                deviceName: device.name,
                wetTarget: device.control.bowls.settings[0].target,
                dryTarget: device.control.bowls.settings[1].target,
                curretWet: fillings.filter(f => f.pets[0].id === pet.id)[0].weights[0].frames[0].current_weight,
                currentDry: fillings.filter(f => f.pets[0].id === pet.id)[0].weights[0].frames[1].current_weight,
                place: PetUtilities.getPlace(pet.status.activity.where),
            });
        });
    };

    async getUpdates(loginData) {
        let newhousehold = await PetCareAPI.getState(loginData);
        this.doorState = PetUtilities.getDoorState(newhousehold.data.devices[4].status.locking.mode);
        let chronik = await PetCareAPI.getChronik(loginData);
        chronik.data.forEach(entry => {
            if (!this.chronik.has(entry.id) && new Date(entry.created_at).getTime() > this.started_at) {
                //console.log("New chronik entry: " + entry.type);
                this.chronik.set(entry.id, entry);
                if (entry.type === 7) {
                    if (entry.movements[0].direction === 2) {
                        this.emit("message", "Het äuä öper d Hang durs törli gha...");
                    } else {
                        this.emit("message", "Es angers chätzli het id stube gluegt 😄")
                    }
                }
                //Filling
                if (entry.type === 21) {
                    this.pets.forEach((petName, pet) => {
                        if (entry.devices[0].name === pet.bowl_name) {
                            pet.bowl_current_dry = entry.weights[0].frames[0].current_weight;
                            pet.bowl_current_wet = entry.weights[0].frames[1].current_weight;
                            this.emit("message", `Added, Nass: ${pet.bowl_current_wet}g & Dry: ${pet.bowl_current_dry}g to ${pet.bowl_name}`)
                        }
                    });

                }
            }
        });
        if (this.household) {
            this.household.data.pets.forEach((pet, i) => {
                let newPlace = this.hasPlaceChanged(newhousehold.data.pets[i], pet);
                if (newPlace) {
                    this.emit(newPlace);
                }
                let eaten = this.hasEaten(newhousehold.data.pets[i], pet);
                if (eaten.length > 0) {
                    eaten.forEach(mes => {
                        this.emit(mes);
                    });
                }
            });
        }
        this.household = newhousehold;
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
                let ate = Math.floor(pet.status.feeding.change[0]) * -1;
                if(ate > 0){
                    feedings.push(`${pet.name} het ${ate}g trochnigs ghaberet`);        
                } else {
                    feedings.push(`${pet.name} het nur chli am trochnige gschnüfflet`);
                }
            }
            if (pet.status.feeding.change[1] !== petBefore.status.feeding.change[1]) {
                let ate = Math.floor(pet.status.feeding.change[1])  * -1;
                if(ate > 0){
                    feedings.push(`${pet.name} het ${ate}g nasses gfrämslet`);        
                } else {
                    feedings.push(`${pet.name} het nur chli am nasse gschnüfflet`);
                }}
            return feedings;
        }

    async getReport(msg){
            logger.info(`create ${msg} report`);
            let household = await PetCareAPI.getState();
            const door = household.data.devices[4].status.locking.mode;
            const pets = household.data.pets.map(pet=>{
                let place = pet.status.activity.where;
                return `${pet.name} ${place === 1 ? `is at home 😊`: `isch dusse 🧐`}` 
            }).join('\n');
            return `S törli isch ${door === 0 ? "offe" : "zue"}\n${pets}`
        }
}


module.exports = Household