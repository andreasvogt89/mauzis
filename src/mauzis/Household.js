const PetCareAPI = require('./PetCareAPI');
const PetUtilities = require('./PetUtilities');

class Household {

    constructor() {
        this.$household = null;
        this.name = null;
        this.doorState = null;
        this.pets = {};
        this.devices = {};
        this.chronik = new Map();
        this.started_at = new Date().getTime();
    }

    async inizialzie(loginData) {
        this.$household = await PetCareAPI.getState(loginData);
        let firstChronik = await PetCareAPI.getChronik(loginData);
        let nextChronik = await PetCareAPI.getMoreChronik(loginData, firstChronik.data[firstChronik.data.length - 1].id);
        let chronik = firstChronik.data.concat(nextChronik.data);
        nextChronik = await PetCareAPI.getMoreChronik(loginData, chronik[chronik.length - 1].id);
        chronik = chronik.concat(nextChronik.data);
        let lastEatings = chronik.filter(entry => entry.type === 22);
        let lastFillings = chronik.filter(entry => entry.type === 21);
        this.name = this.$household.data.households[0].name;
        this.doorState = PetUtilities.getDoorState(this.$household.data.devices[4].status.locking.mode);
        this.$household.data.pets.forEach($pet => {
            let $device = this.$household.data.devices.find(device => device.id == $pet.status.feeding.device_id);
            this.devices[$device.name] = $device;
            let lastEating = lastEatings.filter(e => e.pets[0].id === $pet.id)[0];
            let lastFill = lastFillings.filter(f => f.devices[0].name === $device.name)[0];
            this.pets[$pet.name] = {
                name: $pet.name,
                petID: $pet.id,
                device: $device.id,
                deviceName: $device.name,
                wetTarget: $device.control.bowls.settings[0].target,
                dryTarget: $device.control.bowls.settings[1].target,
                currentDry: Math.round(lastEating.weights[0].frames[0].current_weight),
                currentWet: Math.round(lastEating.weights[0].frames[1].current_weight),
                lastEatenDry: Math.round(lastEating.weights[0].frames[0].change) * -1,
                lastEatenWet: Math.round(lastEating.weights[0].frames[1].change) * -1,
                lastFillDry: Math.round(lastFill.weights[0].frames[0].current_weight),
                lastFillWet: Math.round(lastFill.weights[0].frames[1].current_weight),
                place: PetUtilities.getPlace($pet.status.activity.where),
            };
            this.pets[$pet.name].eatenDry = this.pets[$pet.name].lastFillDry - this.pets[$pet.name].currentDry;
            this.pets[$pet.name].eatenWet = this.pets[$pet.name].lastFillWet - this.pets[$pet.name].currentWet;
        });
    };

    async getUpdates(loginData) {
        let updates = [];
        if (!this.lastUpdate) {
            this.lastUpdate = this.started_at
        }
        let newhousehold = await PetCareAPI.getState(loginData);
        this.doorState = PetUtilities.getDoorState(newhousehold.data.devices[4].status.locking.mode);
        let chronik = await PetCareAPI.getChronik(loginData);
        chronik.data.forEach(entry => {
            if (new Date(entry.created_at).getTime() > this.lastUpdate) {
                console.log("New chronik entry: " + entry.type);

                //Door things
                if (entry.type === 7) {
                    if (entry.movements[0].direction === 2) {
                        updates.push("Het äuä öper d Hang durs törli gha...");
                    } else {
                        updates.push("Es angers chätzli het id stube gluegt 😄")
                    }
                }

                //Filling
                if (entry.type === 21) {
                    Object.keys(this.pets).forEach(petName => {
                        if (entry.devices[0].name === this.pets[petName].deviceName) {
                            let dry = Math.round(entry.weights[0].frames[0].current_weight);
                            let wet = Math.round(entry.weights[0].frames[1].current_weight);
                            this.pets[petName].currentWet = wet;
                            this.pets[petName].currentDry = dry;
                            this.pets[petName].lastFillDry = dry;
                            this.pets[petName].lastFillWet = wet;
                            this.pets[petName].eatenDry = 0;
                            this.pets[petName].eatenWet = 0;
                            updates.push(`Added, Nass: ${this.pets[petName].currentDryWet}g & Dry: ${this.pets[petName].currentDry}g to ${this.pets[petName].deviceName}`)
                        }
                    });
                }
                //Eating
                if (entry.type === 22) {
                    Object.keys(this.pets).forEach(petName => {
                        if (entry.devices[0].name === this.pets[petName].deviceName) {
                            let dry = Math.round(entry.weights[0].frames[0].current_weight);
                            let wet = Math.round(entry.weights[0].frames[1].current_weight);
                            this.pets[petName].currentWet = wet;
                            this.pets[petName].currentDry = dry;
                            this.pets[petName].eatenDry = this.pets[petName].lastFillDry - dry;
                            this.pets[petName].eatenWet = this.pets[petName].lastFillWet - wet;
                            //updates.push(`${this.pets[petName].petName} het Nass: ${this.pets[petName].currentDryWet}g & Dry: ${this.pets[petName].currentDry}g to ${this.pets[petName].deviceName}`)
                        }
                    });
                }
            }
        });
        this.$household.data.pets.forEach((pet, i) => {
            let newPlace = this.hasPlaceChanged(newhousehold.data.pets[i], pet);
            if (newPlace) {
                updates.push(newPlace);
            }
            let eaten = this.hasEaten(newhousehold.data.pets[i], pet);
            if (eaten) {
                updates.push(eaten);
            }
        });
        this.$household.data.devices.forEach(device => {
            this.isBatteryLow(device);
            this.devices[device.name] = device;
        });
        this.$household = newhousehold;
        this.lastUpdate = new Date().getTime();
        return updates;
    }

    hasPlaceChanged(pet, petBefore) {
            if (pet.status.activity.where !== petBefore.status.activity.where) {
                let place = pet.status.activity.where;
                this.pets[pet.name].place = PetUtilities.getPlace(place);
                return `${pet.name} ${place === 1 ? `is at home, Hello ${pet.name} 😍`: `went out, stay safe ❤`}`
            }
        }
    
    isBatteryLow(device){
        if (device.status.battery && device.status.battery < 1) {
            let place = pet.status.activity.where;
            this.pets[pet.name].place = PetUtilities.getPlace(place);
            return `${pet.name} ${place === 1 ? `is at home, Hello ${pet.name} 😍`: `went out, stay safe ❤`}`
        }
    }
    
    hasEaten(pet, petBefore){
            let feedings = null;
            if (pet.status.feeding.change[0] !== petBefore.status.feeding.change[0]) {
                let ate = Math.floor(pet.status.feeding.change[0]) * -1;
                if(ate > 0){
                    feedings = `${pet.name} het ${ate}g trochnigs ghaberet`;        
                } else {
                    feedings = `${pet.name} het nur chli am trochnige gschnüfflet`;
                }
            }
            if (pet.status.feeding.change[1] !== petBefore.status.feeding.change[1]) {
                let ate = Math.floor(pet.status.feeding.change[1])  * -1;
                if(ate > 0){
                    feedings = `${feedings}\n${pet.name} het ${ate}g nasses gfrämslet`;        
                } else {
                    feedings = `${feedings}\n${pet.name} het nur chli am nasse gschnüfflet`;
                }}
            return feedings;
        }
}


module.exports = Household