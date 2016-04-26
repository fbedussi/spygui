var fs = require('fs');
var path = require('path');
var config = require('./config.js');

module.exports = function walk(dir, done) {
    var results = {};

    fs.readdir(dir, function (err, list) {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, results);

        list.forEach(function (fileName) {
            var file = path.resolve(dir, fileName);
            if (config.excludeFolders.indexOf(fileName) < 0) {
                fs.stat(file, function (err, stat) {
                    if (stat && stat.isDirectory()) {
                        walk(file, function (err, res) {
                            results[fileName] = {
                                type: 'dir',
                                path: file,
                                subDir: res
                            };
                            if (!--pending) done(null, results);
                        });
                    } else {
                        results[fileName] = {
                            type: 'file',
                            path: file
                        };
                        if (!--pending) done(null, results);
                    }
                });
            } else {
                if (!--pending) done(null, results);
            }
        });
    });
};