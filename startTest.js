var path = require('path');
var config = require('./config.js');
var Nightwatch = require(path.join(config.startingFolder, '/node_modules/nightwatch/lib/index.js'));


function stringDiff(str1, str2) {
    var maxLenght = Math.max(str1.length, str2.length);
    var i = 0;
    var result = '';

    for (; i < maxLenght; i++) {
        if (str1[i] && str2[i] && str1[i] === str2[i]) {
            result += str1[i];
        } else if ((str1[i] || str2[i]) && result[result.length-1] !== '*' ) {
            result += '*';
        }
    }

    return result;
}

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
        console.log(confObj);
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