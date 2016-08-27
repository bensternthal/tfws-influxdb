'use strict';

/* Influx! */
var influx = require('influx')
var conf = require('./conf');

var client = influx({
    // or single-host configuration
    host: conf.get('influx_host'),
    port: conf.get('influx_port'),
    protocol: 'http',
    username: conf.get('influx_username'),
    password: conf.get('influx_password'),
    database: conf.get('influx_db')
})


exports.writeInflux = function(tfwsData) {
    var points = [
        [{
            'temperature': tfwsData.temperature
        }, {
            location: 'office'
        }],
        [{
            'humidity': tfwsData.humidity
        }, {
            location: 'office'
        }],
        [{
            'illuminance': tfwsData.illuminance
        }, {
            location: 'office'
        }],
        [{
            'air_pressure': tfwsData.air_pressure
        }, {
            location: 'office'
        }]
    ]

    client.writePoints('weather', points, function(err, response) {
        if (err) {
            console.log(err);
        }
    });

};
