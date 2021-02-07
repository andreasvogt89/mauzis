const fetch = require('node-fetch');
require('dotenv').config();
const logger = require('../logger');
let loginData;
let loginInterval = 1800
let household;

async function startLoginPolling() {
    login();
    setInterval(login, 1000 * loginInterval);
}

function login() {
    fetch("https://app.api.surehub.io/api/auth/login", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "content-type": "application/json",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "sec-gpc": "1",
                "x-app-version": "browser",

            },
            "referrer": "https://www.surepetcare.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": `{\"email_address\":\"${process.env.MAIL}\",\"password\":\"${process.env.PASSWORD}\",\"device_id\":\"${process.env.DEVICE_ID}\"}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "omit"
        }).then(res => res.json())
        .then(json => {
            logger.info(`Login successful => next in ${loginInterval}s`);
            loginData = json.data;
            getState();
        }).catch(e => {
            logger.error(`Login failed: ${e}`);
        });
}

async function toggleDoor(bit) {
    let result = null;
    await fetch("https://app.api.surehub.io/api/device/553196/control", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "authorization": `Bearer ${loginData.token}`,
                "content-type": "application/json",
                "x-app-version": "browser",
            },
            "referrer": "https://www.surepetcare.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": `{\"locking\":${bit}}`,
            "method": "PUT",
            "mode": "cors"
        }).then(festchresult => festchresult.json())
        .then(jsonResult => {
            logger.info(jsonResult);
            result = jsonResult
        }).catch((err) => {
            logger.error(err);
            result = err
        });
    return result;
}

async function getState() {
    let result = null;
    await fetch("https://app.api.surehub.io/api/me/start", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "authorization": `Bearer ${loginData.token}`,
                "x-app-version": "browser",
            },
            "referrer": "https://www.surepetcare.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        }).then(festchresult => festchresult.json())
        .then(jsonResult => {
            result = jsonResult;
            household = jsonResult.data;
        }).catch((err) => {
            logger.error(err);
            result = err
        });
    return result;
}

async function resetFeeders(tareNumber) {
    try {
        let feeders = getFeederIDs();
        await asyncForEach(feeders, device_id => {
            fetch(`https://app.api.surehub.io/api/device/${device_id}/control`, {
                    "headers": {
                        "accept": "application/json, text/plain, */*",
                        "authorization": `Bearer ${loginData.token}`,
                        "content-type": "application/json",
                        "x-app-version": "browser",

                    },
                    "referrer": "https://surepetcare.io/",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": `{\"tare\":${tareNumber}}`,
                    "method": "PUT",
                    "mode": "cors",
                    "credentials": "include"
                }).then(festchresult => festchresult.json())
                .then(jsonResult => {
                    logger.info(JSON.stringify(jsonResult))
                });
        });
    } catch (e) {
        logger.error(e);
        return e
    }
}

function getFeederIDs() {
    if (household) {
        let feederIDs = []
        household.devices.forEach(device => {
            if (device.product_id === 4) {
                feederIDs.push(device.id);
            }
        });
        return feederIDs;
    } else throw new Error("NO Devices");

}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    getState,
    toggleDoor,
    startLoginPolling,
    resetFeeders
}