const fetch = require('node-fetch');
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
            "body": `{\"email_address\":\"${process.env.MAIL}\",\"password\":\"${process.env.PASSWORD}\",\"device_id\":\"${process.env.DEVICE_ID}\"}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "omit"
        }).then(res => res.json());
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
        }).then(res => res.json())
    }

    static toggleDoor(bit, loginData) {
        return fetch("https://app.api.surehub.io/api/device/553196/control", {
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
        }).then(res => res.json());
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
        }).then(res => res.json());
    }

    static getChronik(loginData) {
        return fetch("https://app.api.surehub.io/api/timeline/household/60617", {
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
        }).then(res => res.json());
    }

    static getMoreChronik(loginData, before_id) {
        return fetch(`https://app.api.surehub.io/api/timeline/household/60617?before_id=${before_id}`, {
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
        }).then(res => res.json());
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
        }).then(res => res.json());
    }
}

module.exports = PetCareAPI