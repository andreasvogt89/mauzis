class PetUtilities {

    static placeNames = {
        OUT: "dusse",
        INSIDE: "dinne",
    }

    static doorStates = {
        OPEN: "offe",
        CLOSED: "zue",
    }

    static placeCommands = {
        CLOSE: "zue",
        OPEN: "uf",
    }

    static getDoorCommand(mes) {
        return mes === this.placeCommands.CLOSE ? 1 : 0
    }

    static getPetPlaceCommand(place) {
        return place === this.placeNames.INSIDE ? 1 : 2;
    }

    static getPlace(bit) {
        return bit === 1 ? this.placeNames.INSIDE : this.placeNames.OUT;
    }

    static getPlaceEmoij(stat) {
        return stat === this.placeNames.OUT ? '🧐' : '😊';
    }

    static getDoorState(bit) {
        return bit === 1 ? this.doorStates.CLOSED : this.doorStates.OPEN;
    }

    static movementPhrase(petName, bit) {
        return bit === 1 ? `${petName} isch jetz dinne, Hello ${petName} 😍` : `${petName} isch use, stay safe ❤️`
    }

    static unknownMovmentPhrase(bit) {
        return bit === 2 ? "Het äuä öper d Hang durs törli gha..." : "Es angers chätzli het id stube gluegt 😄";
    }


}


module.exports = PetUtilities