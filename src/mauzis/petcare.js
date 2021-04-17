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

    resetFeeders(msg) {
        this.emit('info', `reset feeders ${msg}`);
        let getTareVal = (msg) => {
            if (msg === 'links') {
                return 1
            } else if (msg === 'rechts') {
                return 2
            } else return 3
        }
        let pets = this.household.pets
        Object.keys(pets).forEach((petName, pet) => {
            PetCareAPI.resetFeeder(getTareVal(msg), pet.device, this.loginData)
                .then(res => {
                    console.log(res);
                }).catch(err => {
                    this.emit('error', `set door state error: ${err}`);
                });
        });
    }

    getRport() {
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
}
module.exports = PetCare;