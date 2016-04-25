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
            walk(file, function(err, res) {
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
    });
  });
};