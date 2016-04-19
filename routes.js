var getdir = require("./getdir.js");

var appRouter = function(app) {
    
    
    app.get("/features", function(req, res) {
        getdir(__dirname, function(err, data) {
            //res.send(JSON.stringify(data));
            res.send(data);   
        })
    });
}
 
module.exports = appRouter;