const PetCareAPI = require('./PetCareAPI');
const PetUtilities = require('./PetUtilities');

class Household {

    constructor() {
        this.$household = null;
        this.pets = {};
        this.usedTimelineIds = new Map();
        this.started_at = new Date().getTime();
    }

    async inizialzie(loginData) {
        this.$household = await PetCareAPI.getState(loginData);
        let timeline = await this.getTodaysTimeline(loginData);
        timeline.forEach(entry => {
            this.usedTimelineIds.set(entry.id, entry.created_at);
        });
        let eatings = timeline.filter(entry => entry.type === 22);
        let foodFillings = timeline.filter(entry => entry.type === 21);
        let drinkings = timeline.filter(entry => entry.type === 29);
        let fd = timeline.filter(entry => entry.type === 29 || entry.type === 30);
        let felaquaMessages = fd.filter(entry => entry.type === 34);
        this.$household.data.pets.forEach($pet => {
            if ($pet.status.feeding) {
                let $device = this.$household.data.devices.find(device => device.id == $pet.status.feeding.device_id);
                let eating = eatings.filter(e => e.pets[0].id === $pet.id);
                let foodFilling = foodFillings.filter(f => f.devices[0].name === $device.name);
                let drinking = drinkings.filter(e => e.pets[0].id === $pet.id);
                this.pets[$pet.name] = {
                    name: $pet.name,
                    petID: $pet.id,
                    device: $device.id,
                    deviceName: $device.name,
                    wetTarget: $device.control.bowls.settings[0].target,
                    dryTarget: $device.control.bowls.settings[1].target,
                    currentDry: Math.round(eating[eating.length - 1].weights[0].frames[0].current_weight),
                    currentWet: Math.round(eating[eating.length - 1].weights[0].frames[1].current_weight),
                    lastEatenDry: Math.round(eating[eating.length - 1].weights[0].frames[0].change) * -1,
                    lastEatenWet: Math.round(eating[eating.length - 1].weights[0].frames[1].change) * -1,
                    eatenDrySoFar: this.getEatingsFromToday(eating, 0),
                    eatenWetSoFar: this.getEatingsFromToday(eating, 1),
                    drank: this.getDrinkingsFromToday(drinking),
                    lastFillDry: Math.round(foodFilling[foodFilling.length - 1].weights[0].frames[0].current_weight),
                    lastFillWet: Math.round(foodFilling[foodFilling.length - 1].weights[0].frames[1].current_weight),
                    fillWetToday: this.getFoodFillingsFromToday(foodFilling, 1),
                    fillDryToday: this.getFoodFillingsFromToday(foodFilling, 0),
                    lastFillFood: new Date().toLocaleDateString(),
                    lastDrank: new Date().toLocaleDateString(),
                    place: PetUtilities.placeNames[$pet.status.activity.where],
                };
                this.pets[$pet.name].eatenDry = this.pets[$pet.name].lastFillDry - this.pets[$pet.name].currentDry;
                this.pets[$pet.name].eatenWet = this.pets[$pet.name].lastFillWet - this.pets[$pet.name].currentWet;
                let level = felaquaMessages.map(v=>{return {
                    date: new Date(v.updated_at),
                    level: Math.round(entry.weights[0].frames[0].current_weight)
                }}).sort((a, b) => b.date - a.date);
                this.felaqua_level = level.length > 0 ? level[0].level : 0;
            }
        });
    };

    async getTodaysTimeline(loginData) {
        let now = new Date(new Date().setHours(new Date().getHours() + 2));
        let startOfDay = new Date(now.setHours(2,0,0,0));
        let timeline = [];
        let firstload = await PetCareAPI.getTimeline(this.$household.data.households[0].id, loginData);
        timeline = timeline.concat(firstload.data);
        let lastEntry = new Date(timeline[timeline.length - 1].updated_at).getTime();
        while (startOfDay.getTime() < lastEntry) {
            let load = await PetCareAPI.getMoreTimeline(this.$household.data.households[0].id, loginData, timeline[timeline.length - 1].id);
            load.data.forEach(entry => {
                if (startOfDay.getTime() < new Date(entry.updated_at).getTime()) {
                    timeline.push(entry);
                }
            });
            lastEntry = new Date(load.data[load.data.length - 1].updated_at).getTime();
        }
        return timeline;


    }

    getFoodFillingsFromToday(filling, id) {
        return filling.reduce((acu, entry) => {
            return acu + Math.round(entry.weights[0].frames[id].current_weight)
        }, 0);
    }

    getEatingsFromToday(eating, id) {
        return eating.reduce((acu, entry) => {
            return acu + Math.round(entry.weights[0].frames[id].change) * -1
        }, 0);
    }

    getDrinkingsFromToday(drinking){
        return drinking.reduce((acu,entry) =>{
            return acu + Math.round(entry.weights[0].frames[id].change) * -1
        },0);
    }

    async getUpdates(loginData) {
        let updates = [];
        let newTimeline = null;
        this.$household = await PetCareAPI.getState(loginData);
        newTimeline = await PetCareAPI.getTimeline(this.$household.data.households[0].id, loginData);
        newTimeline.data.forEach(entry => {
            if (!this.usedTimelineIds.has(entry.id)) {
                this.usedTimelineIds.set(entry.id, entry.created_at);
                //Door things
                if (entry.type === 0) {
                    updates.push(PetUtilities.movementPhrase(entry.pets[0].name, entry.movements[0].direction));
                }
                //Unknown Movement
                if (entry.type === 7) {
                    updates.push(PetUtilities.unknownMovementPhrase(entry.movements[0].direction));
                }
                //Filling
                if (entry.type === 21) {
                    Object.keys(this.pets).forEach(petName => {
                        if (entry.devices[0].name === this.pets[petName].deviceName) {
                            let newFillDate = new Date().toLocaleDateString();
                            let isFirstFilling = this.pets[petName].lastFillFood !== newFillDate;
                            this.pets[petName].lastFillFood = newFillDate;
                            let filledDry = Math.round(entry.weights[0].frames[0].current_weight);
                            let filledWet = Math.round(entry.weights[0].frames[1].current_weight);
                            this.pets[petName].currentWet = filledWet;
                            this.pets[petName].currentDry = filledDry;
                            this.pets[petName].lastFillDry = filledDry;
                            this.pets[petName].lastFillWet = filledWet;
                            if (isFirstFilling) {
                                this.pets[petName].fillDryToday = filledDry;
                                this.pets[petName].fillWetToday = filledWet;
                                this.pets[petName].eatenDrySoFar = 0;
                                this.pets[petName].eatenWetSoFar = 0;
                            } else {
                                this.pets[petName].fillDryToday += filledDry;
                                this.pets[petName].fillWetToday += filledWet;
                            }
                            this.pets[petName].eatenDry = 0;
                            this.pets[petName].eatenWet = 0;
                            updates.push(`Füllig vo ${this.pets[petName].deviceName}\n Nass: ${this.pets[petName].currentWet}g & Troche: ${this.pets[petName].currentDry}g`)
                        }
                    });
                }
                //Eating
                if (entry.type === 22) {
                    Object.keys(this.pets).forEach(petName => {
                        if (entry.devices[0].name === this.pets[petName].deviceName) {
                            let currentDry = Math.round(entry.weights[0].frames[0].current_weight);
                            let currentWet = Math.round(entry.weights[0].frames[1].current_weight);
                            let eatenDry = Math.round(entry.weights[0].frames[0].change) * -1;
                            let eatenWet = Math.round(entry.weights[0].frames[1].change) * -1
                            this.pets[petName].currentWet = currentWet;
                            this.pets[petName].currentDry = currentDry;
                            this.pets[petName].eatenDry += eatenDry; 
                            this.pets[petName].eatenWet += eatenWet;
                            this.pets[petName].eatenDrySoFar += eatenDry;
                            this.pets[petName].eatenWetSoFar += eatenWet;
                            updates.push(`${this.pets[petName].name} het gässe 🥫\n ${eatenWet}g Nass & ${eatenDry}g Troche`)
                        }
                    });
                }
                //Reset Feeder
                if (entry.type === 24) {
                    Object.keys(this.pets).forEach(petName => {
                        if (entry.devices[0].name === this.pets[petName].deviceName) {
                            let currentDry = Math.round(entry.weights[0].frames[0].current_weight);
                            let currentWet = Math.round(entry.weights[0].frames[1].current_weight);
                            this.pets[petName].currentWet = currentWet;
                            this.pets[petName].currentDry = currentDry;
                            updates.push(`${entry.devices[0].name } ${PetUtilities.getTareText(JSON.parse(entry.data).tare_type)} zrüggsetzt`)
                        }
                    });
                }
                //Battery threshold
                if(entry.type === 1){
                  let device = entry.devices[0].name
                  updates.push(`${device} batterie stand niedrig!`);
                }       
                //Drinking
                if(entry.type === 29){
                    let petName = entry.pets[0].name;
                    let drank = Math.round(entry.weights[0].frames[0].change * -1);
                    let today = new Date().toLocaleDateString();
                    let isfirstDrinking = this.pets[petName].lastDrank !== today;
                    this.pets[petName].lastDrank = today;
                    if(isfirstDrinking){
                        this.pets[petName].drank = drank;
                    } else {
                        this.pets[petName].drank += drank;
                    }
                    this.felaqua_level = Math.round(entry.weights[0].frames[0].current_weight); 
                    updates.push(`${petName} het ${drank}ml drunke💧`);
                }
                //Filling Felaqua
                if(entry.type === 30){
                   let device = entry.devices[0].name;
                   this.felaqua_level = Math.round(entry.weights[0].frames[0].change);
                   updates.push(`${device} mit ${this.felaqua_level}ml befüllt`); 
                }
                //Reminder Fresh Water for Felaqua
                if(entry.type === 32){
                    let device = entry.devices[0].name;
                    updates.push(`${device} set neus wasser ha!`);
                }                
                //Unknown Felaqua
                if(entry.type === 34){
                    let drank = Math.round(entry.weights[0].frames[0].change * -1);
                    this.felaqua_level = Math.round(entry.weights[0].frames[0].current_weight); 
                    updates.push(`Öpper Unbekannts het ${drank}ml drunke💧`);
                }                
            }
            this.removeOldTimlineEntries();
        });
        return updates;
    }

    removeOldTimlineEntries() {
        this.usedTimelineIds.forEach((val, key) => {
            if (new Date(val).toLocaleDateString().split('.')[1] !== new Date().toLocaleDateString().split('.')[1]) {
                this.emit('info', `Delete: ${val}`);
                this.usedTimelineIds.delete(key);
            }
        });
    }
}


module.exports = Household