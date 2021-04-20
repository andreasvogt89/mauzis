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
                this.household.inizialzie(this.loginData).catch(err => {
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
        setInterval(() => {
            this.household.getUpdates(this.loginData).then(updates => {
                updates.forEach(update => {
                    this.emit('message', update);
                });
            });
        }, 10000);
        return this.loginData && this.household ? true : false;
    }

    setDoorState(msg) {
        this.emit('info', `set door state: ${msg}`);
        let bit = PetUtilities.getDoorCommand(msg);
        PetCareAPI.toggleDoor(bit, this.loginData).then(res => {
            this.emit('message', Array.isArray(res.results) ? "ok 😊" : res.results ? `isch dänk scho ${PetUtilities.getDoorState(bit)}😝` : "öpis isch nid guet😑")
        }).catch(err => {
            this.emit('error', `set door state error: ${err}`);
        });
    }

    newPetPlace(msg) {
        this.emit('info', `set pet place: ${msg}`);
        let pet = this.household.pets[msg.split(' ')[0].charAt(0).toUpperCase() + msg.split(' ')[0].slice(1)];
        if (pet.place === msg.split(' ')[1]) {
            this.emit('message', `${pet.name} isch dänk scho ${msg.split(' ')[1]}🙄`);
        } else {
            let placeInBit = PetUtilities.getPetPlaceCommand(msg.split(' ')[1]);
            PetCareAPI.setPetPlace(pet.petID, placeInBit, this.loginData).then(res => {
                this.emit('info', JSON.stringify(res));
                this.emit('message', res.data ? "ok 😊" : "öpis isch nid guet😑");
                this.household.pets[pet.name].place = msg.split(' ')[1];
            }).catch(err => {
                this.emit('error', `set pet place error: ${err}`);
            });
        }
    }

    resetFeeders(msg) {
        this.emit('info', `reset feeders ${msg}`);
        let getTareVal = (msg) => {
            if (msg === 'links') {
                return 1
            } else if (msg === 'rechts') {
                return 2
            } else return 3
        }
        let pets = this.household.pets;
        Object.keys(pets).forEach((petName) => {
            PetCareAPI.resetFeeder(getTareVal(msg), pets[petName].device, this.loginData)
                .then(res => {
                    this.emit('message', `${pets[petName].deviceName}: ${JSON.stringify(res)}`);
                }).catch(err => {
                    this.emit('error', `set door state error: ${err}`);
                });
        });
    }

    getPetRport() {
        let mes = `${this.household.name} isch ${this.household.doorState}\n***************************\n`
        let pets = this.household.pets
        Object.keys(pets).forEach(petName => {
            mes = `${mes}${petName} isch ${pets[petName].place}${PetUtilities.getPlaceEmoij(pets[petName].place)}\n` +
                `Nassfuetter:\n` +
                `${pets[petName].eatenWet}g vo ${pets[petName].lastFillWet}g gässe, ${pets[petName].currentWet}g übrig \n` +
                `Trochefuetter:\n` +
                `${pets[petName].eatenDry}g vo ${pets[petName].lastFillDry}g gässe, ${pets[petName].currentDry}g übrig \n` +
                `***************************\n`
        });
        this.emit('message', mes);
    }

    getDeviceRport() {
        let mes = '\n***************************\n'
        let devices = this.household.devices;
        Object.keys(devices).forEach(device => {
            if (devices[device].status.battery) {
                mes = `${mes}${device}: ${devices[device].status.battery}\n`
            }
        });
        this.emit('message', mes);
    }
}
module.exports = PetCare;