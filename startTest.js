var path = require('path');
var config = require('./config.js');
//var Nightwatch = require(path.join(config.startingFolder, '/node_modules/nightwatch/lib/index.js'));

module.exports = function(paramObj, Nightwatch) {
    try {
        var groupKey = Object.keys(paramObj).filter(function(key) {
            return paramObj[key].type === 'dir';
        });
        var groupPath = path.relative(path.join(config.startingFolder, 'features'), paramObj[groupKey].path);

        //console.log('starting test | group:', groupPath);
        Nightwatch.runner(
            {
                env: 'chrome',
                group: groupPath
            }
        );

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