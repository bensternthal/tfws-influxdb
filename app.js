'use strict';

var conf = require('./lib/conf');
var tfws = require('./lib/tfws');
var Influx = require('./lib/influx');

var SlackBot = require('slackbots');

// Create & Configure Slackbot
var bot = new SlackBot({
    token: conf.get('slackbot:api_token'),
    name: 'tfws-status'
});
var channel = conf.get('slackbot:channel');
var params = {icon_emoji: ':tfws:'};

// Post to slack we are starting up...
bot.postMessageToGroup(channel, 'TFWS Has Started', params);


// Start Weather Station
tfws.start();
process.stdin.on('data', function(data) {
    bot.postMessageToGroup(channel, 'TFWS Shutting Down', params);
    tfws.stop();
});


function getData() {

    tfws.gettfwsJSON().then(Influx.writeInflux).then(function() {
        setTimeout(getData, conf.get('update_frequency'));
    }).catch(function(e) {
        bot.postMessageToGroup(channel,  e.message);
        // Retry
        setTimeout(getData, conf.get('update_frequency'));
    });

};


//Delay 5 Seconds To Allow Weather Station To Start Prior To Starting Loop
setTimeout(function() {
    getData();
}, 5000);
