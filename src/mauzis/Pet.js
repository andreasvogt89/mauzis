const place = {
    INSIDE: "Dinne",
    OUTSIDE: "Dusse",
}

class Pet {

    constructor(name, bowl_ID, bowl_name, bowl_target_dry, bowl_target_wet) {
        this.name = name;
        this.bowl_ID = bowl_ID;
        this.bowl_name = bowl_name;
        this.bowl_current_wet = 0;
        this.bowl_current_dry = 0;
        this.bowl_target_wet = bowl_target_wet;
        this.bowl_target_dry = bowl_target_dry;
        this.place = place.INSIDE;
    }


}

module.exports = Pet