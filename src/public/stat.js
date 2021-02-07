async function getStatus() {
    await fetch('http://localhost:5000/status')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            let petlist = document.createElement('ul');
            petlist.id = "petlist"
            data.data.pets.forEach(pet => {
                let li = document.createElement('li');
                li.innerHTML = pet.name + " ist " + getPosition(pet);
                petlist.appendChild(li);
            })
            document.getElementById('pets').appendChild(petlist);

            let devicelist = document.createElement('ul');
            devicelist.id = "devicelist"
            data.data.devices.forEach(device => {
                let li = document.createElement('li');
                li.innerHTML = device.name +
                    " {online: " + device.status.online + "}" +
                    getBatteryLevel(device) + getLockMode(device);
                devicelist.appendChild(li);
            })
            document.getElementById('devices').appendChild(devicelist);
        });

}


getStatus();

function getPosition(pet) {
    if (pet.position.where === 1) {
        return "Drinnen"
    } else return "Draussen"
}

function getBatteryLevel(device) {
    if (device.status.battery) {
        return " {Battery level: " + Math.round(device.status.battery, 2) + "} ";
    } else return ""
}

function getLockMode(device) {
    if (device.status.locking) {
        if (device.status.locking.mode === 0) {
            return " ist offen"
        } else return " ist geschlossen"
    } else return ""
}