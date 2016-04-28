var path = require('path');
var config = require('./../config.js');
var Nightwatch = require(path.join(config.startingFolder, '/node_modules/nightwatch/lib/index.js'));

module.exports = function(paramObj) {
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

        //console.log(confObj);
        Nightwatch.runner(confObj);

        // var spawn = require('child_process').spawn;
        // var prc = spawn('nightwatch',  ['--env chrome', '--group Checkout/Guest']);
        //
        // //noinspection JSUnresolvedFunction
        // prc.stdout.setEncoding('utf8');
        // prc.stdout.on('data', function (data) {
        //     var str = data.toString()
        //     var lines = str.split(/(\r?\n)/g);
        //     console.log(lines.join(""));
        // });
        //
        // prc.on('close', function (code) {
        //     console.log('process exit code ' + code);
        // });

    } catch (ex) {
        console.log('ERROR: There was an error while starting the test runner:\n\n');
        process.stderr.write(ex.stack + '\n');
        process.exit(2);
    }
};