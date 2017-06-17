const github = require("octonode");
const util = require("util");
const pixelWidth = require("string-pixel-width");
const semver = require("semver");
const express = require("express");
const http = require('http');
const fs = require("fs");
const app = express();

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 604800, checkperiod: 259200 });

const client = github.client(process.env.GITHUB_TOKEN);

var svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="%s" height="50">
			  <path d="M15,5 h%s a10,10 0 0 1 10,10 v14 a10,10 0 0 1 -10,10 h-%s a10,10 0 0 1 -10,-10 v-14 a10,10 0 0 1 10,-10 z" fill="none" stroke="#144677" stroke-width="1"></path>
			  <a xlink:href="https://standards.github.io" target="_blank">
				<text x="36" y="18" font-family="Arial" font-size="9" fill="grey" font-weight="300">%s</text>
				<image x="9" y="9" width="26" height="26" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjBGMkVDRjM1MzlCMTFFN0FDMEQ5MTM4QkIzRDRBOEIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjBGMkVDRjQ1MzlCMTFFN0FDMEQ5MTM4QkIzRDRBOEIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGMEYyRUNGMTUzOUIxMUU3QUMwRDkxMzhCQjNENEE4QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGMEYyRUNGMjUzOUIxMUU3QUMwRDkxMzhCQjNENEE4QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmRAYgkAAAeaSURBVHjahFYJcFXl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"></image>
			  </a>
				<text x="36" y="32">
				  <tspan font-family="Arial" font-size="12" fill="#144677" font-weight="600">%s</tspan>
				  <tspan font-family="Arial" font-size="12" fill="#144677" font-weight="500">%s</tspan>
				  <tspan font-family="Arial" font-size="12" fill="%s" font-weight="500">●</tspan>
				</text>
			</svg>`;

var getSVG = function(text1, text2, text3, color) {
    var width = pixelWidth(text2 + ' ' + text3, { size: 12 });
    return util.format(svg, width + 34 + 30, width + 34, width + 34, text1, text2, text3, color);
};

var svgs = {
    "ghIssue": getSVG.bind(this, "Error", "GitHub", "issue", "#BF00FF"),
    "invalidIssue": getSVG.bind(this, "Error", "Invalid", "issue", "#FF00FF"),
    "invalidVersion": getSVG.bind(this, "Error", "Invalid", "version", "#0000FF"),
    "invalidRepo": getSVG.bind(this, "Error", "Invalid", "repo", "#FF8000"),
    "versionMismatch": getSVG.bind(this, "Error", "Version", "mismatch", "#000000"),
    "invalidRelease": getSVG.bind(this, "Error", "Invalid", "release", "#BDBDBD"),
    "invalidStandard": getSVG.bind(this, "Error", "Invalid", "standard", "#00FFFF"),
    "upToDate": getSVG.bind(this, "owner/repo", "example", "vX.Y.Z", "#00FF00"),
    "outOfDate": getSVG.bind(this, "owner/repo", "example", "vX.Y.Z", "#FF0000"),
    "invalidTitle": getSVG.bind(this, "Error", "Invalid", "title", "#FFFF66")
};

app.get('/legend', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<html><head><style>body { font-family: Arial; } div {display: block;} div svg {display: inline-block;vertical-align: middle;}</style></head><body>
        <div>`+svgs.upToDate()+`The repository "owner/repo" complies with the latest version of the standard "example"</div>
        <div>`+svgs.outOfDate()+`The repository "owner/repo" complied with an older version of the standard "example"</div>
        <hr>
        <div>`+svgs.ghIssue()+`The GitHub API is throwing some error</div>
        <div>`+svgs.invalidIssue()+`There is no issue with the number provided</div>
        <div>`+svgs.invalidVersion()+`The version section of the validation request is not in the form vX.Y.Z or X.Y.Z (<a href="http://semver.org" target="_blank">semver</a>)</div>
        <div>`+svgs.invalidRepo()+`The repository section of the validation request was not found</div>
        <div>`+svgs.versionMismatch()+`The version section of the validation request does not match with a valid standard version</div>
        <div>`+svgs.invalidRelease()+`The standard does not have a valid release</div>
        <div>`+svgs.invalidStandard()+`The standard is not a validated standard yet</div>
        <div>`+svgs.invalidTitle()+`The title of the validation request was changed after its creation</div>
    </body></html>`);
});

/*app.get('/error/:error', function(req, res) {
 if(errorMessages[req.params.error]) {
 res.setHeader('Content-Type', 'image/svg+xml');
 res.send(errorMessages[req.params.error]());
 } else {
 res.setHeader('Content-Type', 'text/html');
 res.send("Invalid error message: " + req.params.error);
 }
 });*/

app.get('/limits', function(req, res) {
    client.limit(function (err, left, max, reset) {
        if(err !== null) {
            res.send(err.message);
        } else {
            res.send(util.format("Left: %s, Max: %s, Reset: %s", left, max, new Date(reset)));
        }
    });
});

var getIssueInfo = function(title, params) {
    var titleParts = title.split(' ');
    return {
        complierRepo: titleParts[1],
        complierVersion: titleParts[2],
        complyingStandard: params.owner + '/' + params.repo
    }
};

app.get('/badge/:owner/:repo/:issue', function (req, res) {
    res.setHeader('Content-Type', 'image/svg+xml');
    var ghissue = client.issue(req.params.owner + '/' + req.params.repo, req.params.issue);

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

        var allInfo = getIssueInfo(data.title, req.params);

        var cachedResult = myCache.get(allInfo.complierRepo + ':' + allInfo.complyingStandard + ':' + allInfo.complierVersion);
        if(cachedResult !== undefined) {
            console.log(allInfo.complierRepo + ':' + allInfo.complyingStandard + ':' + allInfo.complierVersion, "Cached!")
            res.send(cachedResult);
            return;
        } else {
            console.log(allInfo.complierRepo + ':' + allInfo.complyingStandard + ':' + allInfo.complierVersion, "Not Cached!")
        }

        if(allInfo.complierRepo === "standards/meta" && req.params.issue === "5") {
            var resultSVG = getSVG("standards/meta", "standards/meta", allInfo.complierVersion, "#00FF00");
            myCache.set(allInfo.complierRepo + ':' + allInfo.complyingStandard + ':' + allInfo.complierVersion, resultSVG, function(err, success) {
                if(!err && success){
                    res.send(resultSVG);
                } else {
                    console.log(err, success);
                    res.send(resultSVG);
                }
            });
            return;
        }

        var validated = data.labels.filter(function(label) {
            return label.name == "validated";
        });

        if(validated.length) {
            client.get('/repos/'+allInfo.complyingStandard+'/issues/' + req.params.issue + '/events', { per_page: 100 }, function (err, status, events, headers) {
                var renamings = events.filter(function(event) {
                    return event.event == "renamed";
                });

                if(renamings.length) {
                    res.send(svgs.invalidTitle());
                    return;
                }

                if(semver.valid(allInfo.complyingVersion) === null) {
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
                        if(semver.eq(allInfo.complyingVersion, stable[0].tag_name)) {
                            color = '#00FF00';
                        } else if(semver.lt(allInfo.complyingVersion, stable[0].tag_name)) {
                            color = '#FF0000';
                        } else {
                            res.send(svgs.versionMismatch());
                            return;
                        }
                        var resultSVG = getSVG(allInfo.complierRepo, allInfo.complyingStandard, allInfo.complyingVersion, color);
                        myCache.set(allInfo.complierRepo + ':' + allInfo.complyingStandard + ':' + allInfo.complierVersion, resultSVG, function() {
                            if( !err && success ){
                                res.send(resultSVG);
                            } else {
                                console.log(err);
                                res.send(resultSVG);
                            }
                        });
                    } else {
                        res.send(svgs.invalidRelease());
                    }
                });
            });
        } else {
            res.send(svgs.invalidStandard());
        }
    });
});

app.get('/participants.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    myCache.get('participants', function(err, value){
        if(value != undefined) {
            console.log("Participants cached!");
            res.send(value);
        } else {
            console.log("Participants not cached!");
            client.get('/repos/standards/meta/issues/comments', { per_page: 100 }, function (err, status, result, headers) {
                var participants = [...new Set(result.filter(comment => comment.user.login !== "t-giovl").map(comment => comment.user.login))];
                myCache.set('participants', participants, function(err, success) {
                    res.send(participants);
                });
            });
        }
    });
});

http.createServer(app).listen(80);