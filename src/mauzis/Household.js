const e = require('express');
const PetCareAPI = require('./PetCareAPI');
const PetUtilities = require('./PetUtilities');

class Household {

    constructor() {
        this.$household = null;
        this.name = null;
        this.doorState = null;
        this.pets = {};
        this.devices = {};
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
        let fillings = timeline.filter(entry => entry.type === 21);
        this.name = this.$household.data.households[0].name;
        this.doorState = PetUtilities.getDoorState(this.$household.data.devices[4].status.locking.mode);
        this.$household.data.pets.forEach($pet => {
            let $device = this.$household.data.devices.find(device => device.id == $pet.status.feeding.device_id);
            this.devices[$device.name] = $device;
            let eating = eatings.filter(e => e.pets[0].id === $pet.id);
            let filling = fillings.filter(f => f.devices[0].name === $device.name);
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
                lastFillDry: Math.round(filling[filling.length - 1].weights[0].frames[0].current_weight),
                lastFillWet: Math.round(filling[filling.length - 1].weights[0].frames[1].current_weight),
                fillWetToday: this.getFillingsFromToday(filling, 1),
                fillDryToday: this.getFillingsFromToday(filling, 0),
                place: PetUtilities.getPlace($pet.status.activity.where),
            };
            this.pets[$pet.name].eatenDry = this.pets[$pet.name].lastFillDry - this.pets[$pet.name].currentDry;
            this.pets[$pet.name].eatenWet = this.pets[$pet.name].lastFillWet - this.pets[$pet.name].currentWet;
        });
    };

    async getTodaysTimeline(loginData) {
        let now = new Date();
        let startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let timeline = [];
        let firstload = await PetCareAPI.getTimeline(loginData);
        timeline = timeline.concat(firstload.data);
        let lastEntry = new Date(timeline[timeline.length - 1].updated_at).getTime();
        while (startOfDay.getTime() < lastEntry) {
            let load = await PetCareAPI.getMoreTimeline(loginData, timeline[timeline.length - 1].id);
            load.data.forEach(entry => {
                if (startOfDay.getTime() < new Date(entry.updated_at).getTime()) {
                    timeline.push(entry);
                }
            });
            lastEntry = new Date(load.data[load.data.length - 1].updated_at).getTime();
        }
        return timeline;


    }

    getFillingsFromToday(filling, id) {
        return filling.reduce((acu, fill) => {
            return acu + Math.round(fill.weights[0].frames[id].current_weight)
        }, 0);
    }

    getEatingsFromToday(eating, id) {
        return eating.reduce((acu, meal) => {
            return acu + Math.round(meal.weights[0].frames[id].change) * -1
        }, 0);
    }

    async getUpdates(loginData) {
        let updates = [];
        let newhousehold = await PetCareAPI.getState(loginData);
        this.doorState = PetUtilities.getDoorState(newhousehold.data.devices[4].status.locking.mode);
        let newTimeline = await PetCareAPI.getTimeline(loginData);
        newTimeline.data.forEach(entry => {
            if (!this.usedTimelineIds.has(entry.id)) {
                this.usedTimelineIds.set(entry.id, entry.created_at);
                //Door things
                if (entry.type === 0) {
                    this.pets[entry.pets[0].name].place = PetUtilities.getPlace(entry.movements[0].direction);
                    updates.push(PetUtilities.movementPhrase(entry.pets[0].name, entry.movements[0].direction));
                }
                if (entry.type === 7) {
                    updates.push(PetUtilities.unknownMovmentPhrase(entry.movements[0].direction));
                }
                //Filling
                if (entry.type === 21) {
                    Object.keys(this.pets).forEach(petName => {
                        if (entry.devices[0].name === this.pets[petName].deviceName) {
                            let newFillDate = new Date().toLocaleDateString();
                            let isFirstFilling = this.pets[petName].lastFillDate !== newFillDate;
                            this.pets[petName].lastFillDate = newFillDate;
                            let dry = Math.round(entry.weights[0].frames[0].current_weight);
                            let wet = Math.round(entry.weights[0].frames[1].current_weight);
                            this.pets[petName].currentWet = wet;
                            this.pets[petName].currentDry = dry;
                            this.pets[petName].lastFillDry = dry;
                            this.pets[petName].lastFillWet = wet;
                            if (isFirstFilling) {
                                this.pets[petName].fillDryToday = dry;
                                this.pets[petName].fillWetToday = wet;
                                this.pets[petName].eatenDrySoFar = 0;
                                this.pets[petName].eatenWetSoFar = 0;
                            } else {
                                this.pets[petName].fillDryToday += dry;
                                this.pets[petName].fillWetToday += wet;
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
                            let dry = Math.round(entry.weights[0].frames[0].change) * -1;
                            let wet = Math.round(entry.weights[0].frames[1].change) * -1
                            this.pets[petName].currentWet = currentWet;
                            this.pets[petName].currentDry = currentDry;
                            this.pets[petName].eatenDry = this.pets[petName].lastFillDry - currentDry;
                            this.pets[petName].eatenWet = this.pets[petName].lastFillWet - currentWet;
                            this.pets[petName].eatenDrySoFar += this.pets[petName].lastFillDry - currentDry;
                            this.pets[petName].eatenWetSoFar += this.pets[petName].lastFillWet - currentWet;
                            updates.push(`${this.pets[petName].name} het gässe 🥫\n ${wet}g Nass & ${dry}g Troche`)
                        }
                    });
                }
                //Reset Feeder
                if (entry.type === 24) {
                    Object.keys(this.pets).forEach(petName => {
                        if (entry.devices[0].name === this.pets[petName].deviceName) {
                            let tare = PetUtilities.getTareText(JSON.parse(entry.data).tare_type)
                            let currentDry = Math.round(entry.weights[0].frames[0].current_weight);
                            let currentWet = Math.round(entry.weights[0].frames[1].current_weight);
                            this.pets[petName].currentWet = currentWet;
                            this.pets[petName].currentDry = currentDry;
                            // Message is comming from response of requests
                            //updates.push(`${this.pets[petName].deviceName}  ${tare} zrüggsetzt!`)
                        }
                    });
                }
            }
            this.removeOldTimlineEntries();
        });
        return updates;
    }

    removeOldTimlineEntries() {
        let newMap = new Map();
        this.usedTimelineIds.forEach((val, key) => {
            if (new Date(val).toLocaleDateString() === new Date().toLocaleDateString()) {
                newMap.set(key, val);
            }
        });
        this.usedTimelineIds = newMap;
    }
}


module.exports = Household