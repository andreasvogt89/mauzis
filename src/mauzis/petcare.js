const fetch = require('node-fetch');
require('dotenv').config();
let loginData;
let loginInterval = 1800

function startLoginPolling() {
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
            console.log(`Login successful => next in ${loginInterval}s`);
            loginData = json.data;
        }).catch(e => {
            console.error(`Login failed: ${e}`);
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
            console.log(jsonResult);
            result = jsonResult
        }).catch((err) => {
            console.log(err);
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
            result = jsonResult
        }).catch((err) => {
            console.log(err);
            result = err
        });
    return result;
}

module.exports = {
    getState,
    toggleDoor,
    startLoginPolling
}