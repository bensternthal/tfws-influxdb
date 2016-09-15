'use strict';

var conf = require('./lib/conf');
var tfws = require('./lib/tfws');
var Influx = require('./lib/influx');

// Start Weather Station
tfws.start();
process.stdin.on('data', function(data) {
    tfws.stop();
});

// Delay 5 Seconds To Allow Weather Station To Start Prior To Starting Loop
setTimeout(function() {
    tfwsLoop();
}, 5000);

// Loop to post data at set interval to influx
function tfwsLoop() {
    var tfwsData = tfws.gettfwsJSON();

    Influx.writeInflux(tfwsData);
    // Every 5 minutes send data.
    setTimeout(tfwsLoop, 300000);
}
