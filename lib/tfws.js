'use strict';

/* Utilities for working with TinkerForge WeatherStation */
var Tinkerforge = require('tinkerforge');

var HOST = 'localhost';
var PORT = 4223;
var brickletInterval = 1000;
var lcdInterval = 2000;
var lcd;
var lcdStrings = [];
var tfwsJSON = {};
var ipcon;


/* Starts Weather Station Loop */
exports.start = function() {
    // Create connection and connect to brickd
    ipcon = new Tinkerforge.IPConnection();
    ipcon.connect(HOST, PORT);


    ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
        function(connectReason) {
            // Trigger Enumerate
            ipcon.enumerate();
        }
    );

    // Register Enumerate Callback - The loop
    ipcon.on(Tinkerforge.IPConnection.CALLBACK_ENUMERATE,

        function(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier,
            enumerationType) {

            switch (deviceIdentifier) {
            case Tinkerforge.BrickletLCD20x4.DEVICE_IDENTIFIER:
                lcdInit(uid, ipcon);
                break;
            case Tinkerforge.BrickletAmbientLight.DEVICE_IDENTIFIER:
                ambientLightInit(uid, ipcon);
                break;
            case Tinkerforge.BrickletHumidity.DEVICE_IDENTIFIER:
                humidityInit(uid, ipcon);
                break;
            case Tinkerforge.BrickletBarometer.DEVICE_IDENTIFIER:
                barometerInit(uid, ipcon);
                break;
            default:
                break;
            }
        }
    );

    console.log('Press enter to exit ...');
};

/* Stops Weather Station Loop */
exports.stop = function() {
    lcd.clearDisplay();
    lcd.backlightOff();
    ipcon.disconnect();
    process.exit(0);
};

exports.getTfwsJSON = function() {

    return new Promise(function(resolve, reject) {
        // TODO maybe test for empty object and reject?
        resolve(tfwsJSON);
    });

};


/* Private Utility Methods */

/* LED Bricklet */
function lcdInit(uid, ipcon) {
    lcd = new Tinkerforge.BrickletLCD20x4(uid, ipcon);
    lcd.clearDisplay();
    lcd.backlightOn();
    lcdWrite();
}

/* Update LCD All At Once - Looks Prettier */
function lcdWrite() {
    lcdStrings.forEach(function(message, index) {
        lcd.writeLine(index, 0, message);
    });

    //Update LCD
    setTimeout(lcdWrite, lcdInterval);
}

/* Ambient Light Bricklet */
function ambientLightInit(uid, ipcon) {
    var al = new Tinkerforge.BrickletAmbientLight(uid, ipcon);

    al.setIlluminanceCallbackPeriod(brickletInterval);
    al.on(Tinkerforge.BrickletAmbientLight.CALLBACK_ILLUMINANCE,
        // Callback function for illuminance callback (parameter has unit Lux/10)
        function(illuminance) {
            lcdStrings[0] = 'Illumin: ' + illuminance / 10 + ' Lux';
            tfwsJSON['illuminance'] = illuminance / 10;
        }
    );
}

/* Humidity Bricklet */
function humidityInit(uid, ipcon) {
    var h = new Tinkerforge.BrickletHumidity(uid, ipcon);

    h.setHumidityCallbackPeriod(brickletInterval);
    h.on(Tinkerforge.BrickletHumidity.CALLBACK_HUMIDITY,
        // Callback function for humidity callback (parameter has unit %RH/10)
        function(humidity) {
            lcdStrings[1] = 'Humidity: ' + humidity / 10 + ' %';
            tfwsJSON['humidity'] = humidity / 10;
        }
    );
}

/* Barometer Bricklet */
function barometerInit(uid, ipcon) {
    var b = new Tinkerforge.BrickletBarometer(uid, ipcon);

    b.setAirPressureCallbackPeriod(brickletInterval);
    b.on(Tinkerforge.BrickletBarometer.CALLBACK_AIR_PRESSURE,
        // Callback function for air pressure callback (parameter has unit mbar/1000)
        function(ap) {
            lcdStrings[2] = 'Air Press: ' + ap / 1000;
            tfwsJSON['air_pressure'] = ap / 1000;
            //handle temp
            b.getChipTemperature(
                function(temp) {
                    lcdStrings[3] = 'Temp: ' + temp / 100.0;
                    tfwsJSON['temperature'] = temp / 100.0;
                },
                function(error) {
                    console.log(error);
                }
            );
        }
    );
}
