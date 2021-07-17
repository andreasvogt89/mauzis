class PetUtilities {

    static somethingWrongMsg = "öpis isch nid guet😑";

    static successMsg = "ok 😊";

    static doorAlready = (command) => `isch dänk scho ${PetUtilities.doorStates[command]}😝`

    static petIsAlready = (command) => `isch dänk scho ${PetUtilities.placeNames[command]}🙄`

    static doorStates = {
        0: "offe",
        1: "zue",
    }

    static placeNames = {
        1: "dinne",
        2: "dusse",
    }

    static doorCommands = {
        OPEN: 0,
        CLOSE: 1,
    }

    static petPlaceCommands = {
        INSIDE: 1,
        OUTSIDE: 2
    }

    static products = {
        HUB: 1,
        REPEATER: 2,
        DOOR: 3,
        FEEDER: 4,
        PROGRAMMER: 5,
        DOOR_SMALL: 6,
        FEEDER_LITE: 7,
        FELAQUA: 8,
    }

    static getTareVal(msg) {
        return msg === 'links' ? 1 : msg === 'rechts' ? 2 : 3;
    }

    static getTareText(bit) {
        return bit === 1 ? 'links' : bit === 2 ? 'rechts' : 'beidi';
    }

    static getPlaceEmoij = (stat) => stat === PetUtilities.placeNames[2] ? '🧐' : '😊';

    static movementPhrase(petName, bit) {
        return bit === 1 ? `${petName} isch jetz dinne, Hello ${petName} 😍` :
            bit === 2 ? `${petName} isch use, stay safe ❤️` : `${petName} het dürs törli gluegt 👀`
    }

    static unknownMovementPhrase(bit) {
        return bit === 2 ? "Het äuä öper d Hang durs törli gha..." : "Es angers chätzli het id stube gluegt 😺";
    }


}


module.exports = PetUtilities