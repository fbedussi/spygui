var fs = require('fs');
var path = require('path');

module.exports = function walk(dir, done) {
  var results = {};
  
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
  
    var pending = list.length;
  
    if (!pending) return done(null, results);
  
    list.forEach(function(fileName) {    
      var file = path.resolve(dir, fileName);
      
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
            //console.log(stat);
            //results[file] = {};
            walk(file, function(err, res) {
                //console.log(res);
                results[fileName] = res;
                if (!--pending) done(null, results);
            });
        } else {
          results[fileName] = file;
          if (!--pending) done(null, results);
        }
      });
    });
  });
};