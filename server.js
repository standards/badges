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

var svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="%s" height="50">
<path d="m15 5 h%s a10 10 0 0 1 10 10v14a10 10 0 0 1 -10 10 h-%s a10 10 0 0 1 -10 -10v-14a10 10 0 0 1 10 -10z" fill="none" stroke="#144677"/>
<a target="_blank" xlink:href="https://standards.github.io">
<text x="36" y="18" fill="grey" font-family="Arial" font-size="9" font-weight="300">%s</text>
<image x="9" y="9" width="26" height="26" xlink:href="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiB3aWR0aD0iMzYzLjAwMDAwMHB0IiBoZWlnaHQ9IjQ0NS4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDM2My4wMDAwMDAgNDQ1LjAwMDAwMCINCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4NCg0KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNDQ1LjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSINCmZpbGw9IiMxNDQ2NzciIHN0cm9rZT0ibm9uZSI+DQo8cGF0aCBkPSJNMTc1NyA0Mzc5IGwtNTggLTcwIC0yNCAxOCBjLTEzIDEwIC00NiAzNyAtNzMgNjEgbC01MCA0MiAtNDcgLTc3DQpjLTI2IC00MyAtNDkgLTc5IC01MCAtODEgLTIgLTIgLTQwIDIwIC04NCA0NyAtODAgNTEgLTgxIDUxIC05MCAyOSAtNSAtMTMNCi0yMSAtNTMgLTM2IC05MCBsLTI2IC02NiAtODUgMzUgYy00NiAyMCAtODcgMzQgLTkwIDMxIC0zIC0zIC0xNCAtNDMgLTI1IC04OQ0KLTExIC00NiAtMjEgLTg0IC0yMiAtODYgLTIgLTEgLTM2IDcgLTc3IDE3IC0xMTMgMzAgLTEwNiAzNCAtMTE1IC03MSBsLTcgLTkyDQotOTUgNyAtOTQgNyA3IC05NCA3IC05NSAtOTIgLTcgYy0xMDUgLTkgLTEwMSAtMiAtNzEgLTExNSAxMCAtNDEgMTggLTc1IDE3DQotNzcgLTIgLTEgLTQwIC0xMSAtODYgLTIyIC00NiAtMTEgLTg2IC0yMiAtODkgLTI1IC0zIC0zIDExIC00NCAzMSAtOTAgbDM1DQotODUgLTY2IC0yNiBjLTM3IC0xNSAtNzcgLTMxIC05MCAtMzYgLTIyIC05IC0yMiAtMTAgMjkgLTkwIDI3IC00NCA0OSAtODIgNDcNCi04NCAtMiAtMSAtMzggLTI0IC04MSAtNTAgbC03NyAtNDcgNDIgLTUwIGM4OSAtMTA0IDg4IC04OCAxMSAtMTU0IC0zOCAtMzENCi02OCAtNjAgLTY4IC02NCAwIC00IDMwIC0zMyA2OCAtNjQgNzcgLTY2IDc4IC01MCAtMTEgLTE1NCBsLTQyIC01MCA3NyAtNDcNCmM0MyAtMjYgNzkgLTQ5IDgxIC01MCAyIC0yIC0yMCAtNDAgLTQ3IC04NCAtNTEgLTgwIC01MSAtODEgLTI5IC05MCAxMyAtNSA1Mw0KLTIxIDkwIC0zNiBsNjYgLTI2IC0zNSAtODUgYy0yMCAtNDYgLTM0IC04NyAtMzEgLTkwIDMgLTMgNDUgLTE0IDkzIC0yNiA1NA0KLTEyIDg1IC0yNCA4MiAtMzIgLTIgLTYgLTEzIC00NiAtMjMgLTg5IC0xMyAtNTUgLTE1IC04MCAtNyAtODUgNyAtNSAtMTIgLTY1DQotNTYgLTE3NyAtMzcgLTkzIC05NSAtMjQwIC0xMjkgLTMyNSAtMzMgLTg1IC0xMDQgLTI2NCAtMTU2IC0zOTcgLTUzIC0xMzMNCi05NiAtMjQ0IC05NiAtMjQ2IDAgLTI0IDIxOSAtMzcgNjIyIC0zNyBsMTg3IDAgMjU4IC0yNzAgYzIzMyAtMjQ0IDI2MSAtMjcwDQoyOTAgLTI3MCAyNyAwIDM3IDcgNTYgMzggMjAgMzMgMTA5IDI1MSAzMjggODA5IDM1IDg5IDY0IDE2MSA2NSAxNjAgMSAtMSA1MQ0KLTEyOCAxMTIgLTI4MiAyOTggLTc2MSAyODIgLTcyNSAzMzUgLTcyNSAyOSAwIDU3IDI2IDI5MCAyNzAgbDI1OCAyNzAgMTg3IDANCmM0MDMgMCA2MjIgMTMgNjIyIDM3IDAgMiAtNDMgMTEzIC05NiAyNDYgLTUyIDEzMyAtMTIzIDMxMiAtMTU2IDM5NyAtMzQgODUNCi05MiAyMzIgLTEyOSAzMjUgLTUwIDEyOCAtNjQgMTcxIC01MyAxNzMgMTggNCAxNyAyMiAtNiAxMTIgLTEwIDQxIC0xOCA3NQ0KLTE3IDc3IDIgMSA0MCAxMSA4NiAyMiA0NiAxMSA4NiAyMiA4OSAyNSAzIDMgLTExIDQ0IC0zMSA5MCBsLTM1IDg1IDY2IDI2DQpjMzcgMTUgNzcgMzEgOTAgMzYgMjIgOSAyMiAxMCAtMjkgOTAgLTI3IDQ0IC00OSA4MiAtNDcgODQgMiAxIDM4IDI0IDgxIDUwDQpsNzcgNDcgLTQyIDUwIGMtODkgMTA0IC04OCA4OCAtMTEgMTU0IDM4IDMxIDY4IDYwIDY4IDY0IDAgNCAtMzAgMzMgLTY4IDY0DQotNzcgNjYgLTc4IDUwIDExIDE1NCBsNDIgNTAgLTc3IDQ3IGMtNDMgMjYgLTc5IDQ5IC04MSA1MCAtMiAyIDIwIDQwIDQ3IDg0DQo1MSA4MCA1MSA4MSAyOSA5MCAtMTMgNSAtNTMgMjEgLTkwIDM2IGwtNjYgMjYgMzUgODUgYzIwIDQ2IDM0IDg3IDMxIDkwIC0zIDMNCi00MyAxNCAtODkgMjUgLTQ2IDExIC04NCAyMSAtODYgMjIgLTEgMiA3IDM2IDE3IDc3IDMwIDExMyAzNCAxMDYgLTcxIDExNQ0KbC05MiA3IDcgOTUgNyA5NCAtOTQgLTcgLTk1IC03IC03IDkyIGMtOSAxMDUgLTIgMTAxIC0xMTUgNzEgLTQxIC0xMCAtNzUgLTE4DQotNzcgLTE3IC0xIDIgLTExIDQwIC0yMiA4NiAtMTEgNDYgLTIyIDg2IC0yNSA4OSAtMyAzIC00NCAtMTEgLTkwIC0zMSBsLTg1DQotMzUgLTI2IDY2IGMtMTUgMzcgLTMxIDc3IC0zNiA5MCAtOSAyMiAtMTAgMjIgLTkwIC0yOSAtNDQgLTI3IC04MiAtNDkgLTg0DQotNDcgLTEgMiAtMjQgMzggLTUwIDgxIGwtNDcgNzcgLTUwIC00MiBjLTEwNCAtODkgLTg4IC04OCAtMTU0IC0xMSAtMzEgMzgNCi02MCA2OSAtNjMgNzAgLTMgMSAtMzIgLTI5IC02NCAtNjh6IG0zMDMgLTIyNiBjNTIgLTggMTQyIC0zMCAxOTkgLTQ5IDUwNQ0KLTE2NSA4NzYgLTU5NSA5NjYgLTExMTkgMjMgLTEzMiAyMyAtMzQ4IDAgLTQ4MCAtOTAgLTUyNCAtNDU4IC05NTEgLTk2NQ0KLTExMTkgLTE0OCAtNDkgLTI3OCAtNjkgLTQ0NSAtNjkgLTE2NyAwIC0yOTcgMjAgLTQ0NSA2OSAtNTA3IDE2OCAtODc1IDU5NQ0KLTk2NSAxMTE5IC0yMyAxMzIgLTIzIDM0OCAwIDQ4MCAxMTIgNjUyIDY0MyAxMTMyIDEzMTUgMTE4OSA3MyA2IDIzOCAtNCAzNDANCi0yMXogbS0xMDQxIC0yODM5IGMxMSAtNDcgMjIgLTg5IDI1IC05MiAzIC0zIDQ0IDExIDkwIDMxIGw4NCAzNSAzMCAtNzIgMjkNCi03MyAtODkgLTIzNCBjLTQ5IC0xMjkgLTEwNCAtMjc0IC0xMjMgLTMyMiAtMTggLTQ5IC0zNiAtOTIgLTQwIC05NSAtMyAtMw0KLTM4IDI5IC03OCA3MSBsLTcyIDc3IC05MCAyIGMtMTI0IDIgLTE0MyAzIC0xNDkgOSAtMyAzIDU2IDE2NyAxMzIgMzY0IGwxMzcNCjM1OSA0MCAxMiBjMjIgNyA0MyAxMyA0NyAxMyAzIDEgMTUgLTM4IDI3IC04NXogbTE2ODEgNzEgYzIzIC02IDM4IC00MiAxNjINCi0zNjggNzYgLTE5OCAxMzUgLTM2MyAxMzIgLTM2NiAtNiAtNiAtMjUgLTcgLTE0OSAtOSBsLTkwIC0yIC03MiAtNzcgYy00MA0KLTQyIC03NSAtNzQgLTc4IC03MSAtNiA2IC0zNCA3NiAtMTY3IDQyNSBsLTgwIDIxMyAzMiA3OSAzMiA3OSA4NCAtMzUgYzQ2DQotMjAgODcgLTM0IDkwIC0zMSAzIDMgMTQgNDUgMjYgOTIgMTYgNzEgMjMgODYgMzYgODIgMTAgLTMgMjggLTggNDIgLTExeiIvPg0KPHBhdGggZD0iTTE1ODUgMzk3MCBjLTUxOCAtMTA0IC05MTMgLTUxNCAtMTAwMCAtMTA0MCAtNDEgLTI0MCA0IC01MjkgMTE1DQotNzUxIDEwOCAtMjE0IDMwNiAtNDIzIDUxMCAtNTM3IDc2IC00MyAyMzIgLTEwNCAyNDEgLTk1IDggOSAyOTkgODA5IDI5OSA4MjENCjAgNCAtMjkgMjAgLTY1IDM2IC03MSAzMiAtMTY1IDExNyAtMTk2IDE3OSAtMzIgNjEgLTQyIDE0MCAtMjkgMjE1IDE5IDEwOSA2OA0KMTg4IDE1MyAyNDYgMTkxIDEyOSA0NDkgNjIgNTUwIC0xNDMgMzAgLTYxIDMyIC03MyAzMiAtMTY2IC0xIC04OCAtNCAtMTA3DQotMjggLTE1NiAtNDIgLTg4IC0xNDUgLTE3NCAtMjM4IC0yMDIgLTE0IC01IDkgLTc0IDEzNCAtNDIwIGwxNTEgLTQxNSA2NiAyNA0KYzMyNSAxMjMgNjA1IDQwOSA3MjUgNzQ0IDQxIDExNSA2NCAyMzMgNzEgMzY1IDMzIDYyMSAtMzkzIDExNzAgLTEwMDUgMTI5NQ0KLTEzMCAyNiAtMzU1IDI2IC00ODYgMHoiLz4NCjwvZz4NCjwvc3ZnPg=="/>
</a>
<text x="36" y="32" fill="#144677" font-family="Arial" font-size="12">
<tspan font-weight="600">%s</tspan>
<tspan font-weight="500">%s</tspan>
</text>
<path d="m15 6 h%s a9 9 0 0 1 9 9v14a9 9 0 0 1 -9 9 h-%s a9 9 0 0 1 -9 -9v-14a9 9 0 0 1 9 -9z" fill="none" stroke="%s"/>
</svg>`;

var getSVG = function(text1, text2, text3, color) {
    var width = Math.round(pixelWidth(text2 + ' ' + text3, { size: 12 }));
    return util.format(svg, width + 34 + 20, width + 26, width + 26, text1, text2, text3, width + 26, width + 26, color);
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
    "minorOutOfDate": getSVG.bind(this, "owner/repo", "example", "vX.Y.Z", "#FFF200"),
    "majorOutOfDate": getSVG.bind(this, "owner/repo", "example", "vX.Y.Z", "#FF0000"),
    "invalidTitle": getSVG.bind(this, "Error", "Invalid", "title", "#CD853F")
};

app.get('/legend', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<html><head><style>body { font-family: Arial; } div {display: block;} div svg {display: inline-block;vertical-align: middle;}</style></head><body>
        <div>`+svgs.upToDate()+`The repository "owner/repo" complies with the latest version of the standard "example"</div>
        <div>`+svgs.minorOutOfDate()+`The repository "owner/repo" complies with a minor older version of the standard "example"</div>
        <div>`+svgs.majorOutOfDate()+`The repository "owner/repo" complied with a major older version of the standard "example"</div>
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

        if(allInfo.complierRepo === "standards/meta" && req.params.issue === "4") {
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
                        myCache.set(allInfo.complierRepo + ':' + allInfo.complyingStandard + ':' + allInfo.complierVersion, resultSVG, function(err, success) {
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
                var participants = [...new Set(result.map(comment => comment.user.login))];
                myCache.set('participants', participants, function(err, success) {
                    res.send(participants);
                });
            });
        }
    });
});

http.createServer(app).listen(80);
