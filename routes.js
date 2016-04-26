var express = require('express');
var path = require('path');
var getEnvironments = require('./getEnvironments.js');
var getDir = require('./getdir.js');
var startTest = require('./startTest');
var config = require('./config.js');

module.exports = function(app) {

    app.use('/', express.static(__dirname));

    app.get('/environments', function(req, res) {
        getEnvironments(config.startingFolder, function(err, data) {
            res.send(data);
        })
    });
    
    app.get('/features', function(req, res) {
        getDir(path.join(config.startingFolder, 'features'), function(err, data) {
            res.send(data);   
        })
    });
    
    app.post('/launchspy', function(req, res) {
        console.log(req.body);
        res.end();
        startTest(req.body);
    });
    
}