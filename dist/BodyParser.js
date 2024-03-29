"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDependencies = void 0;
const core_1 = require("@actions/core");
const github = require("@actions/github");
const customDomains = (_b = (_a = (0, core_1.getInput)('custom-domains')) === null || _a === void 0 ? void 0 : _a.split(/(\s+)/)) !== null && _b !== void 0 ? _b : [];
const keyPhrases = 'depends on|blocked by';
const issueTypes = 'issues|pull';
const domainsList = ['github.com'].concat(customDomains); // add others from parameter
const domainsString = combineDomains(domainsList);
const quickLinkRegex = new RegExp(`(${keyPhrases}) #(\\d+)`, 'gmi');
const partialLinkRegex = new RegExp(`(${keyPhrases}) ([-_\\w]+)\\/([-._a-z0-9]+)(#)(\\d+)`, 'gmi');
const partialUrlRegex = new RegExp(`(${keyPhrases}) ([-_\\w]+)\\/([-._a-z0-9]+)\\/(${issueTypes})\\/(\\d+)`, 'gmi');
const fullUrlRegex = new RegExp(`(${keyPhrases}) https?:\\/\\/(?:${domainsString})\\/([-_\\w]+)\\/([-._a-z0-9]+)\\/(${issueTypes})\\/(\\d+)`, 'gmi');
const markdownRegex = new RegExp(`(${keyPhrases}) \\[.*\\]\\(https?:\\/\\/(?:${domainsString})\\/([-_\\w]+)\\/([-._a-z0-9]+)\\/(${issueTypes})\\/(\\d+)\\)`, 'gmi');
function escapeDomainForRegex(domain) {
    return domain.replace('.', '\\.');
}
function combineDomains(domains) {
    return domains.map(x => escapeDomainForRegex(x)).join('|');
}
function extractFromMatch(match) {
    return {
        owner: match[2],
        repo: match[3],
        pull_number: parseInt(match[5], 10)
    };
}
function getAllDependencies(body) {
    const allMatches = [];
    const quickLinkMatches = [...body.matchAll(quickLinkRegex)];
    if (quickLinkMatches.length !== 0) {
        quickLinkMatches.forEach(match => {
            (0, core_1.info)(`  Found number-referenced dependency in '${match}'`);
            allMatches.push({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                pull_number: parseInt(match[2], 10)
            });
        });
    }
    const extractableMatches = [...body.matchAll(partialLinkRegex)]
        .concat([...body.matchAll(partialUrlRegex)])
        .concat([...body.matchAll(fullUrlRegex)])
        .concat([...body.matchAll(markdownRegex)]);
    if (extractableMatches.length !== 0) {
        extractableMatches.forEach(match => {
            (0, core_1.info)(`  Found number-referenced dependency in '${match}'`);
            allMatches.push(extractFromMatch(match));
        });
    }
    return allMatches;
}
exports.getAllDependencies = getAllDependencies;
