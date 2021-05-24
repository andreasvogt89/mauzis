const axios = require('axios');

//Only for internal use..
module.exports = (callback) => {
    axios.get('http://tractive:3000/report').then((res) => {
        callback(res.data);
    }).catch((err) => {
        callback(err);
    });
}