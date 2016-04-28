var fs = require('fs')
var path = require('path');
var config = require('./config.js');
var Gherkin = require('gherkin')
var parser = new Gherkin.Parser()


function walk(dir, done) {
    var results = [];

    (function recursive(dir, done) {

        fs.readdir(dir, function (err, list) {
            if (err) return done(err);

            var pending = list.length;

            if (!pending) return done(null, results);

            list.forEach(function (fileName) {
                var file = path.resolve(dir, fileName);
                if (config.excludeFolders.indexOf(fileName) < 0) {
                    fs.stat(file, function (err, stat) {
                        if (stat && stat.isDirectory()) {
                            recursive(file, function (err, res) {
                                if (!--pending) done(null, results);
                            });
                        } else {
                            results.push(file)
                            if (!--pending) done(null, results);
                        }
                    });
                } else {
                    if (!--pending) done(null, results);
                }
            });
        });
    })(dir, done)
};

module.exports = function(cb) {

    walk(process.cwd() + '/features', function (err, files) {
        //console.log('FILES:', files);
        if (err || files.length == 0) {
            console.error(err ? err : 'No feature files found at ' + process.cwd() + '\\features');
            cb('ERROR');
        }

        var tags = []

        files.forEach(function(file) {
            var data = fs.readFileSync(file, 'utf8')

            var gherkinDocument = parser.parse(data)

            gherkinDocument.feature.tags.forEach(function (tag) {
                tags.push(tag.name.substr(1));
            })
        })

        //console.log('TAGS:', tags));

        cb(null,  tags.sort().filter(function(item, pos, self) {
            return self.indexOf(item) === pos;
        }));
    })
}