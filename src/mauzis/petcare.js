const PetCareAPI = require('./PetCareAPI');
const Household = require('./Household');
const EventEmitter = require('events');


class PetCare extends EventEmitter {

    constructor() {
        super();
        this.household = null
    }

    start() {
        PetCareAPI.login().then(res => res.json())
            .then(json => {
                this.emit('start', `Login Percare successful, user: ${json.data.user.id}`);
                this.emit('start', "next in 12h");
                this.loginData = json.data;
                this.household = new Household();
                this.household.inizialzie(this.loginData).catch(err => {
                        this.emit('error', `Household failed: ${err}`);
                    })
                    //this.household.getUpdates(loginData);
            }).catch((err) => {
                this.emit('error', `Login Petcare failed: ${err}`);
            });
        setInterval(() => {
            PetCareAPI.login().then(res => res.json())
                .then(json => {
                    this.emit('start', `Login Percare successful, user: ${json.data.user.id}`);
                    this.emit('start', "next in 12h");
                    this.loginData = json.data
                }).catch((err) => {
                    this.emit('error', `Login Petcare failed: ${err}`)
                });
        }, 12 * 3600 * 1000);
        setInterval(() => {
            this.household.getUpdates(this.loginData);
        }, 10000);
    }
}
module.exports = PetCare;