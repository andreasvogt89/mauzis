const fetch = require('node-fetch');
const logger = require('../logger');
require('dotenv').config();

class PetCareAPI {

    static login() {
        return fetch("https://app.api.surehub.io/api/auth/login", {
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
            "body": `{\"email_address\":\"${process.env.MAIL}\",\"password\":\"${process.env.PASSWORD}\",\"${process.env.DEVICE_ID}\":\"${null}\"}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "omit"
        }).then(res => res.json()).catch(err => logger.error(err));
    }

    static getMetaData(loginData) {
        return fetch("https://app.api.surehub.io/api/start", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": `Bearer ${loginData.token}`,
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "sec-gpc": "1",
                "x-app-version": "browser",
            },
            "referrer": "https://www.surepetcare.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        }).then(res => res.json()).catch(err => logger.error(err));;
    }

    static getState(loginData) {
        return fetch("https://app.api.surehub.io/api/me/start", {
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
        }).then(res => res.json()).catch(err => logger.error(err));
    }

    static toggleDoor(doorId, command, loginData) {
        return fetch(`https://app.api.surehub.io/api/device/${doorId}/control`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "authorization": `Bearer ${loginData.token}`,
                "content-type": "application/json",
                "x-app-version": "browser",
            },
            "referrer": "https://www.surepetcare.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": `{\"locking\":${command}}`,
            "method": "PUT",
            "mode": "cors"
        }).then(res => res.json()).catch(err => logger.error(err));;
    }

    static resetFeeder(tareNumber, device_id, loginData) {
        return fetch(`https://app.api.surehub.io/api/device/${device_id}/control`, {
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
        }).then(res => res.json()).catch(err => logger.error(err));
    }

    static getTimeline(house_id, loginData) {
        return fetch(`https://app.api.surehub.io/api/timeline/household/${house_id}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": `Bearer ${loginData.token}`,
                "if-none-match": "\"hKH93JDMi6VsTBAzU185l+kM4Tc=\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "sec-gpc": "1",
                "x-app-version": "browser",
                "x-device-id": "bde6c6fc80"
            },
            "referrer": "https://www.surepetcare.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        }).then(res => res.json()).catch(err => logger.error(err));
    }

    static getMoreTimeline(house_id, loginData, before_id) {
        return fetch(`https://app.api.surehub.io/api/timeline/household/${house_id}?before_id=${before_id}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": `Bearer ${loginData.token}`,
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "sec-gpc": "1",
                "x-app-version": "browser",
                "x-device-id": "7c02b43db7"
            },
            "referrer": "https://www.surepetcare.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        }).then(res => res.json()).catch(err => logger.error(err));
    }

    static setPetPlace(petID, whereBit, loginData) {
        return fetch(`https://app.api.surehub.io/api/pet/${petID}/position`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": `Bearer ${loginData.token}`,
                "content-type": "application/json",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "sec-gpc": "1",
                "x-app-version": "browser",
                "x-device-id": "81df2ec2b5"
            },
            "referrer": "https://www.surepetcare.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": `{\"where\":${whereBit},\"since\":\"${new Date().toISOString().replace("T"," ").slice(0, -5)}\"}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(res => res.json()).catch(err => logger.error(err));
    }
}

module.exports = PetCareAPI