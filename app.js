var express = require("express");
var bodyParser = require("body-parser");
var app = express();

module.exports = function (Nightwatch) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    var routes = require("./routes.js")(app, Nightwatch);

    var server = app.listen(3000, function () {
        console.log("Listening on port %s...", server.address().port);
    });
};