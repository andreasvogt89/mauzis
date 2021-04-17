class PetUtilities {

    static placeNames = {
        OUT: "dusse",
        IN: "dinne",
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

    static getPlace(bit) {
        return bit === 1 ? this.placeNames.IN : this.placeNames.OUT;
    }

    static getPlaceEmoij(stat) {
        return stat === this.placeNames.OUT ? '🧐' : '😊';
    }

    static getDoorState(bit) {
        return bit === 1 ? this.doorStates.CLOSED : this.doorStates.OPEN;
    }


}


module.exports = PetUtilities