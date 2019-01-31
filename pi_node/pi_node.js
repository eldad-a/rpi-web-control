/* https://learn.adafruit.com/monitor-your-home-with-the-raspberry-pi-b-plus/monitoring-your-home-via-wifi */
 
/*
  The server code in Javascript including the required Node modules: 
  (1) the node-dht-sensor module to handle the DHT sensor as before and 
  (2) Express to handle HTTP communications like a web server.
*/

// Require
var sensorLib = require('node-dht-sensor');
var express = require('express');
var app = express();

/*
  We also include the views and public directory. The views directory is where
  we will store the interface, while the public directory is where we will put
  both the Javascript code and the recorded pictures:
 */

// Configure app
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/public'))

/* 
  We will create a route for the interface, which will allow us to access the
  our project:
*/ 
// Serve interface
app.get('/interface', function(req, res){
    res.render('interface');
});

/*
 We will include the Raspberry Pi version of the aREST API (http://arest.io/)
 for us to control the Raspberry Pi via HTTP:
*/
var piREST = require('pi-arest')(app);

/* 
 We also give an ID and a name to your Pi:
*/
// Set Pi properties
piREST.set_id('1');
piREST.set_name('my_RPi');

/*
 Finally, we call the app.listen() function to start our application:
 */ 
// Make measurements from sensors
var dht_sensor = {
    initialize: function () {
        return sensorLib.initialize(11, 4);
    },
    read: function () {
        var readout = sensorLib.read();
        
        piREST.variable('temperature',readout.temperature.toFixed(2));
        piREST.variable('humidity', readout.humidity.toFixed(2));
        
        console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
            'humidity: ' + readout.humidity.toFixed(2) + '%');
        setTimeout(function () {
            dht_sensor.read();
        }, 2000);
    }
};
if (dht_sensor.initialize()) {
    dht_sensor.read();
} else {
    console.warn('Failed to initialize sensor');
}

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
