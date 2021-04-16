class PetUtilities {

    static getPlace(bit) {
        return bit === 1 ? "Dinne" : "Dusse";
    }

    static getDoorState(bit) {
        return bit === 1 ? "Zue" : "Offe";
    }
}

module.exports = PetUtilities