var getdir = require("./getdir.js");
var express = require("express");

module.exports = function(app) {

    app.use("/", express.static(__dirname));
    
    app.get("/features", function(req, res) {
        getdir(__dirname, function(err, data) {
            res.send(data);   
        })
    });
    
    app.post('/launchspy', function(req, res) {
        console.log(req.body);
        res.end();
    });
    
}