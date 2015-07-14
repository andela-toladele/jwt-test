// Required Modules
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var app        = express();

require('dotenv').load();


var port = process.env.PORT || 3001;
 
var database = require('./app/config/dbconf');
console.log(database.url);
// Connect to DB
mongoose.connect(database.url);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.use(express.static(__dirname + '/public'));

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// load the routes
require('./app/routes')(router);

app.use('/api', router);


// application -------------------------------------------------------------
app.get('/*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

process.on('uncaughtException', function(err) {
  console.log(err);
});

// Start Server
app.listen(port, function () {
  console.log( "Express server listening on port " + port);
});