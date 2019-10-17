const config = require('../config')

class Notification {
    constructor() {
    }
    send(history, userData) {
        var headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": `Basic ${config.notifications.apiKey}`
        };

        var options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };

        var https = require('https');
        var req = https.request(options, function (res) {
            res.on('data', function (data) {
                console.log("Response:");
                console.log(JSON.parse(data));
            });
        });

        req.on('error', function (e) {
            console.log("ERROR:");
            console.log(e);
        });

        req.write(JSON.stringify({ 
            app_id: `${config.notifications.appId}`,
            contents: {"en": "Someone needs help"},
            included_segments: ["Helpers"] // ["All"], ["Users"], ["Active Users"], etc.
          }));
        req.end();
    }
}

module.exports = new Notification()
