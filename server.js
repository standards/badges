const github = require("octonode");
const util = require("util");
const pixelWidth = require("string-pixel-width");
const semver = require("semver");
const express = require("express");
const app = express();

const client = github.client(process.env.GITHUB_TOKEN);

var svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="%s" height="50">
  <path d="M15,5 h%s a10,10 0 0 1 10,10 v20 a10,10 0 0 1 -10,10 h-%s a10,10 0 0 1 -10,-10 v-20 a10,10 0 0 1 10,-10 z" fill="none" stroke="#144677" stroke-width="1" />
  <a xlink:href="https://standards.github.io" target="_blank">
    <text x="42" y="20" font-family="Arial" font-size="10" fill="grey" font-weight="300">GitHub Standard</text>
    <image x="8" y="9" width="32" height="32" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkU2MEUwRTk0RTQ2MTFFN0FBRTZEMDY2NTkxQjk5QTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkU2MEUwRUE0RTQ2MTFFN0FBRTZEMDY2NTkxQjk5QTUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGRTYwRTBFNzRFNDYxMUU3QUFFNkQwNjY1OTFCOTlBNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGRTYwRTBFODRFNDYxMUU3QUFFNkQwNjY1OTFCOTlBNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgfAAXUAAAoaSURBVHjajFcJcFRV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" />
  </a>
    <text x="42" y="37">
      <tspan font-family="Arial" font-size="15" fill="#144677" font-weight="600">%s</tspan>
      <tspan font-family="Arial" font-size="15" fill="#144677" font-weight="500">%s</tspan>
      <tspan font-family="Arial" font-size="15" fill="%s" font-weight="500">●</tspan>
    </text>
</svg>`;

var getSVG = function(text1, text2, color) {
    var width = pixelWidth(text1 + ' ' + text2, { size: 15 });
    if(width < 115 - 36) width = 115 - 38;
    return util.format(svg, width + 38 + 30, width + 38, width + 38, text1, text2, color);
};

var svgs = {
    "timeout": getSVG.bind(this, "Timeout", "", "#BF00FF"),
    "invalidIssue": getSVG.bind(this, "Invalid", "issue", "#FF00FF"),
    "invalidVersion": getSVG.bind(this, "Invalid", "version", "#0000FF"),
    "invalidRepo": getSVG.bind(this, "Invalid", "repo", "#FF8000"),
    "versionMismatch": getSVG.bind(this, "Version", "mismatch", "#000000"),
    "invalidRelease": getSVG.bind(this, "Invalid", "release", "#BDBDBD"),
    "invalidStandard": getSVG.bind(this, "Invalid", "standard", "#00FFFF"),
    "upToDate": getSVG.bind(this, "Standard", "vX.Y.Z", "#00FF00"),
    "outOfDate": getSVG.bind(this, "Standard", "vX.Y.Z", "#FF0000")
};

app.get('/legend', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<html><head><style>body { font-family: Arial; } div {display: block;} div svg {display: inline-block;vertical-align: middle;}</style></head><body>
        <div>`+svgs.upToDate()+`The standard is up-to-date</div>
        <div>`+svgs.outOfDate()+`The standard is out of date</div>
        <hr>
        <div>`+svgs.timeout()+`The GitHub API connection timeout</div>
        <div>`+svgs.invalidIssue()+`There is no issue with the number provided</div>
        <div>`+svgs.invalidVersion()+`The issue's version section is not in the form vX.Y.Z</div>
        <div>`+svgs.invalidRepo()+`The issue's repository section was not found</div>
        <div>`+svgs.versionMismatch()+`The issue's version section does not match with a valid standard version</div>
        <div>`+svgs.invalidRelease()+`The issue's repository does not have a valid release</div>
        <div>`+svgs.invalidStandard()+`The issue's standard is not a validated standard yet</div>
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

app.get('/badge/:issue', function (req, res) {
    res.setHeader('Content-Type', 'image/svg+xml');
    var ghissue = client.issue('Standards/meta', req.params.issue);
    ghissue.info(function(err, data) {
        if(err !== null) {
            if(err.code) {
                switch(err.code) {
                    case "ETIMEDOUT":
                        res.send(svgs.timeout());
                        break;
                }
            } else if(err.statusCode) {
                switch(err.statusCode) {
                    case 404:
                        res.send(svgs.invalidIssue());
                        break;
                }
            }

            return;
        }

        var validated = data.labels.filter(function(label) {
            return label.name == "validated";
        });

        if(validated.length) {
            var titleParts = data.title.split(' ');
            var standardPath = titleParts[0].split('/');
            var title = standardPath[1];
            var version = titleParts[titleParts.length - 1];

            if(req.params.issue === 5) {
                res.send(getSVG("meta", version, "#00FF00"));
                return;
            }

            if(version[0] !== 'v') {
                res.send(svgs.invalidVersion());
                return;
            }

            var ghrepo = client.repo(titleParts[0]);
            ghrepo.releases(function(err, info) {
                if(err !== null) {
                    res.send(svgs.invalidRepo());
                    return
                }
                var color;
                var stable = info.filter(function(release) {
                    return release.draft == false;
                });
                if(stable.length) {
                    if(semver.eq(version, stable[0].tag_name)) {
                        color = '#00FF00';
                    } else if(semver.lt(version, stable[0].tag_name)) {
                        color = '#FF0000';
                    } else {
                        res.send(svgs.versionMismatch());
                        return;
                    }
                    res.send(getSVG(title, version, color));
                } else {
                    res.send(svgs.invalidRelease());
                }
            });
        } else {
            res.send(svgs.invalidStandard());
        }
    });
});

app.listen(80, function () {
    console.log('App listening on port 80!');
});

