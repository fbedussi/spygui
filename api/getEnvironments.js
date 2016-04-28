'use strict';

var path = require('path');

module.exports = function(startingFolder, done) {
    var nightwatchConfig = require(path.join(startingFolder, 'nightwatch.conf.js'));

    if (typeof nightwatchConfig.test_settings !== 'object') {
        done('Wrong nightwatch configuration file');
    }

    done(null, nightwatchConfig.test_settings);
};