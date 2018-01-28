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
<image x="9" y="9" width="26" height="26" xlink:href="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAyMDAxMDkwNC8vRU4iDQogImh0dHA6Ly93d3cudzMub3JnL1RSLzIwMDEvUkVDLVNWRy0yMDAxMDkwNC9EVEQvc3ZnMTAuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciDQogd2lkdGg9IjM2My4wMDAwMDBwdCIgaGVpZ2h0PSI0NDUuMDAwMDAwcHQiIHZpZXdCb3g9IjAgMCAzNjMuMDAwMDAwIDQ0NS4wMDAwMDAiDQogcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCI+DQoNCjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLDQ0NS4wMDAwMDApIHNjYWxlKDAuMTAwMDAwLC0wLjEwMDAwMCkiDQpmaWxsPSIjMGU0Nzc4IiBzdHJva2U9Im5vbmUiPg0KPHBhdGggZD0iTTE3NTcgNDM3OSBsLTU4IC03MCAtMjQgMTggYy0xMyAxMCAtNDYgMzcgLTczIDYxIGwtNTAgNDIgLTQ3IC03Nw0KYy0yNiAtNDMgLTQ5IC03OSAtNTAgLTgxIC0yIC0yIC00MCAyMCAtODQgNDcgLTgwIDUxIC04MSA1MSAtOTAgMjkgLTUgLTEzDQotMjEgLTUzIC0zNiAtOTAgbC0yNiAtNjYgLTg1IDM1IGMtNDYgMjAgLTg3IDM0IC05MCAzMSAtMyAtMyAtMTQgLTQzIC0yNSAtODkNCi0xMSAtNDYgLTIxIC04NCAtMjIgLTg2IC0yIC0xIC0zNiA3IC03NyAxNyAtMTEzIDMwIC0xMDYgMzQgLTExNSAtNzEgbC03IC05Mg0KLTk1IDcgLTk0IDcgNyAtOTQgNyAtOTUgLTkyIC03IGMtMTA1IC05IC0xMDEgLTIgLTcxIC0xMTUgMTAgLTQxIDE4IC03NSAxNw0KLTc3IC0yIC0xIC00MCAtMTEgLTg2IC0yMiAtNDYgLTExIC04NiAtMjIgLTg5IC0yNSAtMyAtMyAxMSAtNDQgMzEgLTkwIGwzNQ0KLTg1IC02NiAtMjYgYy0zNyAtMTUgLTc3IC0zMSAtOTAgLTM2IC0yMiAtOSAtMjIgLTEwIDI5IC05MCAyNyAtNDQgNDkgLTgyIDQ3DQotODQgLTIgLTEgLTM4IC0yNCAtODEgLTUwIGwtNzcgLTQ3IDQyIC01MCBjODkgLTEwNCA4OCAtODggMTEgLTE1NCAtMzggLTMxDQotNjggLTYwIC02OCAtNjQgMCAtNCAzMCAtMzMgNjggLTY0IDc3IC02NiA3OCAtNTAgLTExIC0xNTQgbC00MiAtNTAgNzcgLTQ3DQpjNDMgLTI2IDc5IC00OSA4MSAtNTAgMiAtMiAtMjAgLTQwIC00NyAtODQgLTUxIC04MCAtNTEgLTgxIC0yOSAtOTAgMTMgLTUgNTMNCi0yMSA5MCAtMzYgbDY2IC0yNiAtMzUgLTg1IGMtMjAgLTQ2IC0zNCAtODcgLTMxIC05MCAzIC0zIDQ1IC0xNCA5MyAtMjYgNTQNCi0xMiA4NSAtMjQgODIgLTMyIC0yIC02IC0xMyAtNDYgLTIzIC04OSAtMTMgLTU1IC0xNSAtODAgLTcgLTg1IDcgLTUgLTEyIC02NQ0KLTU2IC0xNzcgLTM3IC05MyAtOTUgLTI0MCAtMTI5IC0zMjUgLTMzIC04NSAtMTA0IC0yNjQgLTE1NiAtMzk3IC01MyAtMTMzDQotOTYgLTI0NCAtOTYgLTI0NiAwIC0yNCAyMTkgLTM3IDYyMiAtMzcgbDE4NyAwIDI1OCAtMjcwIGMyMzMgLTI0NCAyNjEgLTI3MA0KMjkwIC0yNzAgMjcgMCAzNyA3IDU2IDM4IDEzIDIwIDMzIDYyIDQ1IDkyIDE4IDUwIDMyMiA4MjAgMzQwIDg2MyA1IDEzIDI1DQotMjggNzEgLTE0NSAyMTggLTU1NiAzMDggLTc3NyAzMjggLTgxMCAxOSAtMzEgMjkgLTM4IDU2IC0zOCAyOSAwIDU3IDI2IDI5MA0KMjcwIGwyNTggMjcwIDE4NyAwIGM0MDMgMCA2MjIgMTMgNjIyIDM3IDAgMiAtNDMgMTEzIC05NiAyNDYgLTUyIDEzMyAtMTIzDQozMTIgLTE1NiAzOTcgLTM0IDg1IC05MiAyMzIgLTEyOSAzMjUgLTUwIDEyOCAtNjQgMTcxIC01MyAxNzMgMTggNCAxNyAyMiAtNg0KMTEyIC0xMCA0MSAtMTggNzUgLTE3IDc3IDIgMSA0MCAxMSA4NiAyMiA0NiAxMSA4NiAyMiA4OSAyNSAzIDMgLTExIDQ0IC0zMQ0KOTAgbC0zNSA4NSA2NiAyNiBjMzcgMTUgNzcgMzEgOTAgMzYgMjIgOSAyMiAxMCAtMjkgOTAgLTI3IDQ0IC00OSA4MiAtNDcgODQNCjIgMSAzOCAyNCA4MSA1MCBsNzcgNDcgLTQyIDUwIGMtODkgMTA0IC04OCA4OCAtMTEgMTU0IDM4IDMxIDY4IDYwIDY4IDY0IDAgNA0KLTMwIDMzIC02OCA2NCAtNzcgNjYgLTc4IDUwIDExIDE1NCBsNDIgNTAgLTc3IDQ3IGMtNDMgMjYgLTc5IDQ5IC04MSA1MCAtMiAyDQoyMCA0MCA0NyA4NCA1MSA4MCA1MSA4MSAyOSA5MCAtMTMgNSAtNTMgMjEgLTkwIDM2IGwtNjYgMjYgMzUgODUgYzIwIDQ2IDM0DQo4NyAzMSA5MCAtMyAzIC00MyAxNCAtODkgMjUgLTQ2IDExIC04NCAyMSAtODYgMjIgLTEgMiA3IDM2IDE3IDc3IDMwIDExMyAzNA0KMTA2IC03MSAxMTUgbC05MiA3IDcgOTUgNyA5NCAtOTQgLTcgLTk1IC03IC03IDkyIGMtOSAxMDUgLTIgMTAxIC0xMTUgNzEgLTQxDQotMTAgLTc1IC0xOCAtNzcgLTE3IC0xIDIgLTExIDQwIC0yMiA4NiAtMTEgNDYgLTIyIDg2IC0yNSA4OSAtMyAzIC00NCAtMTENCi05MCAtMzEgbC04NSAtMzUgLTI2IDY2IGMtMTUgMzcgLTMxIDc3IC0zNiA5MCAtOSAyMiAtMTAgMjIgLTkwIC0yOSAtNDQgLTI3DQotODIgLTQ5IC04NCAtNDcgLTEgMiAtMjQgMzggLTUwIDgxIGwtNDcgNzcgLTUwIC00MiBjLTEwNCAtODkgLTg4IC04OCAtMTU0DQotMTEgLTMxIDM4IC02MCA2OSAtNjMgNzAgLTMgMSAtMzIgLTI5IC02NCAtNjh6IG0yOTMgLTIyNiBjMzY0IC01MyA3MjcgLTI4Mw0KOTQwIC01OTQgMTcwIC0yNDggMjUyIC01MTQgMjUyIC04MTQgMCAtNDk0IC0yMjkgLTkxNiAtNjU0IC0xMjAzIC0xMzUgLTkyDQotMzUzIC0xNzYgLTUzMyAtMjA3IC0xMjcgLTIyIC0zNTcgLTIyIC00ODAgMCAtNTk1IDEwMyAtMTA2OCA1NzYgLTExNzAgMTE3MA0KLTIzIDEzMiAtMjMgMzQ4IDAgNDgwIDYxIDM1NiAyNTggNjgxIDU0NCA4OTUgMzIzIDI0NCA2ODggMzM0IDExMDEgMjczeg0KbS0xMDMxIC0yODM5IGMxMSAtNDcgMjIgLTg5IDI1IC05MiAzIC0zIDQ0IDExIDkwIDMxIGw4NCAzNSAzMCAtNzIgMjkgLTczDQotODkgLTIzNCBjLTQ5IC0xMjkgLTEwNCAtMjc0IC0xMjMgLTMyMiAtMTggLTQ5IC0zNiAtOTIgLTQwIC05NSAtMyAtMyAtMzggMjkNCi03OCA3MSBsLTcyIDc3IC05MCAyIGMtMTI0IDIgLTE0MyAzIC0xNDkgOSAtMyAzIDU2IDE2NyAxMzIgMzY0IGwxMzcgMzU5IDQwDQoxMiBjMjIgNyA0MyAxMyA0NyAxMyAzIDEgMTUgLTM4IDI3IC04NXogbTE2ODEgNzEgYzIzIC02IDM4IC00MiAxNjIgLTM2OCA3Ng0KLTE5OCAxMzUgLTM2MyAxMzIgLTM2NiAtNiAtNiAtMjUgLTcgLTE0OSAtOSBsLTkwIC0yIC03MiAtNzcgYy00MCAtNDIgLTc1DQotNzQgLTc4IC03MSAtNiA2IC0zNCA3NiAtMTY3IDQyNSBsLTgwIDIxMyAzMiA3OSAzMiA3OSA4NCAtMzUgYzQ2IC0yMCA4NyAtMzQNCjkwIC0zMSAzIDMgMTQgNDUgMjYgOTIgMTYgNzEgMjMgODYgMzYgODIgMTAgLTMgMjggLTggNDIgLTExeiIvPg0KPHBhdGggZD0iTTE2MTAgMzk4NSBjLTM2MyAtNTcgLTcwMCAtMjkwIC04OTAgLTYxNSAtMTA2IC0xODIgLTE3MCAtNDE4IC0xNzANCi02MzIgMCAtMTc3IDUzIC00MDUgMTMxIC01NjAgMTE4IC0yMzcgMzMxIC00NTAgNTY4IC01NjkgMTQwIC03MCAyMDQgLTg0IDIzNQ0KLTUzIDEzIDEyIDE2IDQwIDE2IDE0MyBsMCAxMjcgLTExNyAtMSBjLTEwMCAwIC0xMjUgMyAtMTY0IDIxIC02OSAzMiAtMTEzIDc3DQotMTQ5IDE1MSAtNDEgODggLTcxIDEyNyAtMTMxIDE3MCAtMzEgMjIgLTQ5IDQyIC00OSA1NSAwIDE5IDUgMjAgNTggMTYgNzMgLTUNCjE0MCAtNDkgMTg3IC0xMjMgNjggLTEwNSAxMzIgLTE0MCAyNDUgLTEzMyA4OCA2IDEzMCAyMyAxMzAgNTIgMCAyNSAzNSAxMDQNCjU2IDEyNyAxNCAxNiAxMiAxOCAtMjggMjQgLTI4MSA0MyAtNDQxIDE3MyAtNTA1IDQwNyAtMTMgNDUgLTE4IDEwMSAtMTggMTkzDQoxIDE2MyAxNyAyMTMgMTEwIDM0MSAxMyAxNyAxMyAyNyA0IDUwIC0xOCA0NCAtMTUgMTgwIDUgMjQ3IDE1IDUxIDE5IDU3IDQ0DQo1NyA2MyAwIDE2MSAtMzggMjc3IC0xMDUgbDQ0IC0yNiA4MyAxNyBjMTE0IDI1IDM1MiAyNSA0NjQgMSBsODIgLTE4IDk2IDUxDQpjOTYgNTIgMTc2IDgwIDIyOCA4MCAyNSAwIDI5IC02IDQzIC01MiAyMCAtNzIgMjQgLTE2MiAxMSAtMjI4IC0xMSAtNTUgLTExDQotNTUgMjcgLTExMiA2NyAtMTAwIDgyIC0xNTQgODEgLTMwMyAwIC0zNTggLTE1OSAtNTM5IC01MjYgLTYwMCBsLTM3IC02IDI5DQotNDUgYzQyIC02NyA1MCAtMTIyIDUwIC0zNTQgMCAtMTc2IDIgLTIxMSAxNiAtMjI0IDMxIC0zMSA5NSAtMTcgMjM1IDUzIDIzOA0KMTE5IDQ0OSAzMzEgNTY4IDU2OSA3OCAxNTYgMTMxIDM4NCAxMzEgNTYzIDAgNTU4IC0zNzggMTA1NiAtOTIwIDEyMTIgLTE2MA0KNDcgLTM3NyA1OSAtNTUwIDMyeiIvPg0KPHBhdGggZD0iTTEwMDAgMjE5NiBjMCAtOSA3IC0xNiAxNiAtMTYgMTcgMCAxNCAyMiAtNCAyOCAtNyAyIC0xMiAtMyAtMTIgLTEyeiIvPg0KPHBhdGggZD0iTTEwNTUgMjE2MCBjLTEwIC0xNyAxMiAtMzcgMjUgLTI0IDggOCA2IDE1IC00IDIzIC0xMCA5IC0xNiA5IC0yMSAxeiIvPg0KPHBhdGggZD0iTTExMDAgMjA4MSBjMCAtMTUgNiAtMjEgMjEgLTIxIDE0IDAgMTkgNSAxNyAxNyAtNSAyNiAtMzggMjkgLTM4IDR6Ii8+DQo8cGF0aCBkPSJNMTE1NyAyMDI0IGMtMTAgLTEwIDEyIC00NCAyOSAtNDQgMTAgMCAxNCA4IDEyIDIyIC0zIDIyIC0yNyAzNSAtNDENCjIyeiIvPg0KPHBhdGggZD0iTTEyNDAgMTk2MSBjMCAtMTQgMjggLTMzIDQwIC0yNiAyMCAxMiAxMCAzNSAtMTUgMzUgLTE0IDAgLTI1IC00DQotMjUgLTl6Ii8+DQo8cGF0aCBkPSJNMTQ0NCAxOTU5IGMtOSAtMTUgMTIgLTMzIDMwIC0yNiA5IDQgMTYgMTMgMTYgMjIgMCAxNyAtMzUgMjEgLTQ2IDR6Ii8+DQo8cGF0aCBkPSJNMTM0NSAxOTUwIGMtNCAtNyAtMyAtMTYgMyAtMjIgMTQgLTE0IDQ3IC02IDQ3IDEyIDAgMTggLTQwIDI2IC01MA0KMTB6Ii8+DQo8L2c+DQo8L3N2Zz4NCg=="/>
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
    "invalidTitle": getSVG.bind(this, "Error", "Invalid", "title", "#FFFF66")
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
