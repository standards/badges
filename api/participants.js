const github = require("octonode");
const client = github.client(process.env.GITHUB_TOKEN);

module.exports = (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=604800');
    res.setHeader('Content-Type', 'application/json');
    client.get('/repos/standards/meta/issues/comments', { per_page: 100 }, function (err, status, result, headers) {
        var participants = [...new Set(result.map(comment => comment.user.login))];
        res.send(participants);
    });
}