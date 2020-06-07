const github = require("octonode");
const util = require("util");
const client = github.client(process.env.GITHUB_TOKEN);

module.exports = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    client.limit(function (err, left, max, reset) {
        if(err !== null) {
            res.send(err.message);
        } else {
            res.send(util.format("Left: %s, Max: %s, Reset: %s", left, max, new Date(reset)));
        }
    });
}