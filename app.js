var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var open = require('open');

module.exports = (function () {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    var routes = require("./routes.js")(app);

    var server = app.listen(3000, function () {
        console.log("Listening on port %s...", server.address().port);
    });

    open('http://localhost:' + server.address().port, function (err) {
        if (err) {
            throw err;
            console.log('The user closed the browser');
        }
    });
})();