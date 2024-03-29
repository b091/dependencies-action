"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = void 0;
const core_1 = require("@actions/core");
const BodyParser_1 = require("./BodyParser");
const OctoKit_1 = require("./OctoKit");
const Artifact_1 = require("./Artifact");
const evaluate = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: pullRequest } = yield OctoKit_1.octokit.rest.pulls.get({
            owner: OctoKit_1.githubContext.repo.owner,
            repo: OctoKit_1.githubContext.repo.repo,
            pull_number: OctoKit_1.githubContext.issue.number
        });
        if (!pullRequest.body) {
            (0, core_1.info)('Body empty');
            return;
        }
        (0, core_1.info)('\nReading PR body...');
        const dependencies = (0, BodyParser_1.getAllDependencies)(pullRequest.body);
        (0, core_1.info)('\nAnalyzing lines...');
        const relatedPullRequests = [];
        for (const pullRequestDependency of dependencies) {
            (0, core_1.info)(`  Fetching '${JSON.stringify(pullRequestDependency)}'`);
            const { data: pullRequest } = yield OctoKit_1.octokit.rest.pulls.get(Object.assign({}, pullRequestDependency));
            if (!pullRequest)
                continue;
            if (!pullRequest.merged && !pullRequest.closed_at) {
                (0, core_1.info)('    PR is still open.');
            }
            else {
                (0, core_1.info)('    PR has been closed.');
            }
            const artifact = yield (0, Artifact_1.getArtifactData)({
                owner: pullRequestDependency.owner,
                repo: pullRequestDependency.repo
            });
            relatedPullRequests.push(Object.assign({}, pullRequest));
        }
        if (relatedPullRequests.length !== 0) {
            let msg = '\nThe following issues need to be resolved before this PR can be merged:\n';
            for (const pr of relatedPullRequests) {
                msg += `\n#${pr.number} - ${pr.title}`;
            }
            (0, core_1.setFailed)(msg);
        }
        else {
            (0, core_1.info)('\nAll dependencies have been resolved!');
            // Send image variables
        }
    }
    catch (e) {
        (0, core_1.setFailed)(e === null || e === void 0 ? void 0 : e.message);
        throw e;
    }
});
exports.evaluate = evaluate;
