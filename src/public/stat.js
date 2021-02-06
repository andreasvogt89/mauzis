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
                li.innerHTML = device.name;
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