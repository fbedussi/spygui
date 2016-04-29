'use strict';

var path = require('path');
var config = require('./../config.js');
var spawn = require('cross-spawn');

module.exports = function(paramObj) {
    //var nightwatch = new Nightwatch();
    
    try {
        //console.log(paramObj);
        var confObj = {
            env: paramObj.environments.join(',')
        }
        if (paramObj.dir !== 'all') {
            confObj.group = path.relative(path.join(config.startingFolder, 'features'), paramObj.dir);
        }
        if (paramObj.exclude) {
            confObj.skipgroup = paramObj.exclude.map(function(excludeFullPath){
                return path.relative(path.join(config.startingFolder, 'features'), excludeFullPath);
            }).join(',');
        }
        if (paramObj.file) {
            confObj['filter'] = path.basename(paramObj.file, '.feature') + '.*';
        }
        if (paramObj.tagsIncluded) {
            confObj.tag = paramObj.tagsIncluded.join(',');
        }
        if (paramObj.tagsExcluded) {
            confObj.skiptags = paramObj.tagsExcluded.join(',');
        }
        console.log(confObj);

        var command = 'nightwatch';
        var args = [];

        Object.keys(confObj).forEach(function(key) {
            if (confObj[key]) {
                args.push('--' + key);
                args.push(confObj[key]);
            }
        });

        console.log('I\'m running nightwatch with the following command: ', command + ' ' + args.join(' '));

        var child = spawn(command, args, { stdio: 'inherit', detached: false });
    } catch (ex) {
        console.log('ERROR: There was an error while starting the test runner:\n\n');
        process.stderr.write(ex.stack + '\n');
        process.exit(2);
    }
};