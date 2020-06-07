const github = require("octonode");
const client = github.client(process.env.GITHUB_TOKEN);

module.exports = (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=604800');
    res.setHeader('Content-Type', 'application/json');
    client.get('/repos/standards/meta/stargazers', { per_page: 200 }, function (err, status, result, headers) {
        var stargazers = [...new Set(result.map(stargazer => stargazer.login))];
        res.send(stargazers);
    });
}