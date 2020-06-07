const github = require("octonode");
const client = github.client(process.env.GITHUB_TOKEN);
const common = require('../../../../src/common');
const svgs = common.svgs;
const getSVG = common.getSVG;

var getIssueInfo = function(title, params) {
    var titleParts = title.split(' ');
    return {
        complierRepo: titleParts[1],
        complierVersion: titleParts[2],
        complyingStandard: params.owner + '/' + params.repo
    }
};

module.exports = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Cache-Control', 's-maxage=604800');

    res.setHeader('Content-Type', 'image/svg+xml');
    var ghissue = client.issue(req.query.owner + '/' + req.query.repo, req.query.issue);

    ghissue.info(function(err, data) {
        if(err !== null) {
            console.log(err);
            if(err.code) {
                switch(err.code) {
                    case "ETIMEDOUT":
                        res.send(svgs.ghIssue());
                        break;
                }
            } else if(err.statusCode) {
                switch(err.statusCode) {
                    case 404:
                        res.send(svgs.invalidIssue());
                        break;
                    case 401:
                        res.send(svgs.ghIssue());
                        break;
                }
            }

            return;
        }

        var allInfo = getIssueInfo(data.title, req.query);

        if(allInfo.complierRepo === "standards/meta" && req.query.issue === "4") {
            var resultSVG = getSVG("standards/meta", "standards/meta", allInfo.complierVersion, "#00FF00");
            res.send(resultSVG);
            return;
        }

        var validated = data.labels.filter(function(label) {
            return label.name == "validated";
        });

        if(validated.length) {
            client.get('/repos/'+allInfo.complyingStandard+'/issues/' + req.query.issue + '/events', { per_page: 100 }, function (err, status, events, headers) {
                var renamings = events.filter(function(event) {
                    return event.event == "renamed";
                });

                if(renamings.length) {
                    res.send(svgs.invalidTitle());
                    return;
                }

                if(semver.valid(allInfo.complierVersion) === null) {
                    res.send(svgs.invalidVersion());
                    return;
                }

                var ghrepo = client.repo(allInfo.complyingStandard);
                ghrepo.releases(function(err, info) {
                    if(err !== null) {
                        console.log(err);
                        res.send(svgs.invalidRepo());
                        return
                    }
                    var color;
                    var stable = info.filter(function(release) {
                        return release.draft == false;
                    });
                    if(stable.length) {
                        switch(semver.diff(allInfo.complierVersion, stable[0].tag_name)) {
                            case 'major': 
                                color = '#FF0000';
                                break;
                            case 'minor':
                            case 'preminor':
                            case 'patch':
                            case 'prepatch':
                                color = '#FFFF00';
                            case null:
                                color = '#00FF00';
                                break;
                        }
                        if(color === null) {
                            res.send(svgs.versionMismatch());
                            return;
                        }
                        var resultSVG = getSVG(allInfo.complierRepo, allInfo.complyingStandard, allInfo.complierVersion, color);
                        res.send(resultSVG);
                    } else {
                        res.send(svgs.invalidRelease());
                    }
                });
            });
        } else {
            res.send(svgs.invalidStandard());
        }
    });
}