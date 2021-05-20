const PetCareAPI = require('./PetCareAPI');
const Household = require('./Household');
const EventEmitter = require('events');
const PetUtilities = require('./PetUtilities');

class PetCare extends EventEmitter {

    constructor() {
        super();
        this.household = null;
        this.loginData = null;
    }

    async start() {
        await PetCareAPI.login()
            .then(json => {
                this.emit('info', `Login Percare successful, user: ${json.data.user.id}`);
                this.emit('info', "next in 12h");
                this.loginData = json.data;
                this.household = new Household();
                this.household.inizialzie(this.loginData).then(() => {
                    setInterval(() => {
                        this.household.getUpdates(this.loginData).then(updates => {
                            updates.forEach(update => {
                                this.emit('message', update);
                            });
                        });
                    }, 10000);
                }).catch(err => {
                    this.emit('error', `Household failed: ${err}`);
                });
            }).catch((err) => {
                this.emit('error', `Login Petcare failed: ${err}`);
            });
        setInterval(() => {
            PetCareAPI.login()
                .then(json => {
                    this.emit('info', `Login Percare successful, user: ${json.data.user.id}`);
                    this.emit('info', "next in 12h");
                    this.loginData = json.data
                }).catch((err) => {
                    this.emit('error', `Login Petcare failed: ${err}`)
                });
        }, 12 * 3600 * 1000);
        return this.loginData && this.household ? true : false;
    }

    setDoorState(name, command) {
        this.emit('info', `set ${name} to ${PetUtilities.doorStates[command]}`);
        let { id } = this.household.$household.data.devices.find(device => device.name === name);
        PetCareAPI.toggleDoor(id, command, this.loginData).then(res => {
            this.emit('message', Array.isArray(res.results) ? PetUtilities.successMsg : res.results ? PetUtilities.doorAlready(command) : PetUtilities.somethingWrongMsg)
        }).catch(err => {
            this.emit('error', `set door state error: ${err}`);
        });
    }

    setPetPlace(name, command) {
        this.emit('info', `set ${name} to ${PetUtilities.placeNames[command]}`);
        let pet = this.household.$household.data.pets.find(pet => pet.name === name);
        if (pet.status.activity.where === command) {
            this.emit('message', PetUtilities.petIsAlready(command));

        } else {
            PetCareAPI.setPetPlace(pet.id, command, this.loginData).then(res => {
                this.emit('message', res.data ? PetUtilities.successMsg : PetUtilities.somethingWrongMsg);
            }).catch(err => {
                this.emit('error', `set pet place error: ${err}`);
            });
        }
    }

    resetFeeders(msg) {
        this.emit('info', `reset feeders ${msg}`);
        let pets = this.household.pets;
        Object.keys(pets).forEach((petName) => {
            PetCareAPI.resetFeeder(PetUtilities.getTareVal(msg), pets[petName].device, this.loginData)
                .then(res => {
                    if (res.results) {
                        this.emit('message', `${pets[petName].deviceName}:\n${PetUtilities.getTareText(res.results[0].data.tare)} zrüggsetzt`);
                    } else {
                        this.emit('message', `${pets[petName].deviceName}:\n Hmm öbis isch nid guet 🤕`);
                    }
                }).catch(err => {
                    this.emit('error', `set door state error: ${err}`);
                });
        });
    }

    getPetRport() {
        let msg = "";
        this.household.$household.data.devices.forEach(device => {
            if (device.product_id === PetUtilities.products.DOOR || device.product_id === PetUtilities.products.DOOR_SMALL) {
                msg = `${device.name} isch ${PetUtilities.doorStates[device.status.locking.mode]}\n***************************\n`
            }
        })
        this.household.$household.data.pets.forEach(pet => {
            let where = PetUtilities.placeNames[pet.status.activity.where]
            msg = `${msg}${pet.name} isch ${where}${PetUtilities.getPlaceEmoij(where)}\n`;
            if (this.household.pets[pet.name]) {
                msg = `${msg}Nass:\n` +
                    `${this.household.pets[pet.name].eatenWet}g vo ${this.household.pets[pet.name].lastFillWet}g gässe, ${this.household.pets[pet.name].currentWet}g übrig \n` +
                    `Gsamt ${this.household.pets[pet.name].eatenWetSoFar}g vo ${this.household.pets[pet.name].fillWetToday}g gässe\n` +
                    `Troche:\n` +
                    `${this.household.pets[pet.name].eatenDry}g vo ${this.household.pets[pet.name].lastFillDry}g gässe, ${this.household.pets[pet.name].currentDry}g übrig \n` +
                    `Gsamt ${this.household.pets[pet.name].eatenDrySoFar}g vo ${this.household.pets[pet.name].fillDryToday}g gässe\n` +
                    `***************************\n`
            }
        });
        this.emit('message', msg);
    }

    getDeviceRport() {
        let mes = '\n***************************\n'
        this.household.$household.data.devices.forEach(device => {
            if (device.status.battery) {
                mes = `${mes}${device.name}: ${device.status.battery}\n`
            }
        });
        this.emit('message', mes);
    }
}
module.exports = PetCare;