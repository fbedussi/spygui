'use strict';

var path = require('path');
var config = require('./../config.js');
var spawn = require('cross-spawn');
//var spawn = require('better-spawn');
//var spawn = require('child_process').spawn;
//var Nightwatch = require(path.join(config.startingFolder, '/node_modules/nightwatch/lib/index.js'));
//var nightwatchConf = require(path.join(config.startingFolder, 'nightwatch.conf.js'));

module.exports = function(paramObj) {
    //var nightwatch = new Nightwatch();
    
    try {
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
        //console.log(nightwatchConf);
        //confObj.test_settings = nightwatchConf.test_settings;
        //console.log(confObj);
        // Nightwatch.runner(confObj, function(data){
        //     console.log('TEST END');
        //     console.log(data);
        // });
        //
        
        var command = 'nightwatch';
        var args = [];

        Object.keys(confObj).forEach(function(key) {
            if (confObj[key]) {
                args.push('--' + key);
                args.push(confObj[key]);
            }
        });

        console.log('I\'m running nightwatch with the following command: ', command + ' ' + args.join(' '));
        // const exec = require('child_process').exec;
        // const child = exec(command + ' ' + args.join(' '),
        //     (error, stdout, stderr) => {
        //         console.log(`stdout: ${stdout}`);
        //         console.log(`stderr: ${stderr}`);
        //         if (error !== null) {
        //             console.log(`exec error: ${error}`);
        //         }
        //     });

        var child = spawn(command, args, { stdio: 'inherit' });


    } catch (ex) {
        console.log('ERROR: There was an error while starting the test runner:\n\n');
        process.stderr.write(ex.stack + '\n');
        process.exit(2);
    }
};