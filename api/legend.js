const svgs = require('../src/common').svgs;

module.exports = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
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
}