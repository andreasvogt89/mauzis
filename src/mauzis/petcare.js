const PetCareAPI = require('./mauzis/PetCareAPI');
const logger = require('./logger');
const petcare = new PetCareAPI();
petcare.login().then(res => res.json())
    .then(json => {
        logger.info(`Login Percare successful, user: ${json.data.user.id}`);
        logger.info("Start login interval every 12h");
        petcare.loginData = json.data
    }).catch((err) => {
        logger.error(`Login Petcare failed: ${err}`)
    });
setInterval(() => {
    petcare.login().then(res => res.json())
        .then(json => {
            logger.info(`Login Percare successful, user: ${json.data.user.id}`);
            logger.info("next in 12h");
            petcare.loginData = json.data
        }).catch((err) => {
            logger.error(`Login Petcare failed: ${err}`)
        });
}, 12 * 3600);