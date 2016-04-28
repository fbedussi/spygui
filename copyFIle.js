var fs = require('fs');
var path = require('path');

    var cwd = require('path').resolve();
    console.log(cwd);
    fs.createReadStream('runGui.js').pipe(fs.createWriteStream(path.join(cwd,'runGui.js')));
