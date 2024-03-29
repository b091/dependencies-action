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
exports.getArtifactData = void 0;
const artifact_1 = require("@actions/artifact");
const dotenv_1 = require("dotenv");
const OctoKit_1 = require("./OctoKit");
const artifactClient = new artifact_1.DefaultArtifactClient();
const getEnvFile = () => {
    const myData = {};
    (0, dotenv_1.config)({
        path: './publish-output/.env',
        processEnv: myData
    });
    return myData;
};
const getArtifactData = (params) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const repoPullRequest = yield OctoKit_1.octokit.rest.pulls.get(Object.assign(Object.assign({}, params), { pull_number: 112 }));
    const repoRuns = yield OctoKit_1.octokit.actions.listWorkflowRunsForRepo(Object.assign(Object.assign({}, params), { head_sha: repoPullRequest.data.head.sha }));
    const repoRunArtifacts = yield OctoKit_1.octokit.actions.listWorkflowRunArtifacts(Object.assign(Object.assign({}, params), { run_id: repoRuns.data.workflow_runs[0].id, head_sha: repoPullRequest.data.head.sha, name: 'publish-output' }));
    const publishArtifact = repoRunArtifacts.data.artifacts.pop();
    if (((_a = publishArtifact === null || publishArtifact === void 0 ? void 0 : publishArtifact.workflow_run) === null || _a === void 0 ? void 0 : _a.id) && (publishArtifact === null || publishArtifact === void 0 ? void 0 : publishArtifact.id)) {
        yield artifactClient.downloadArtifact(publishArtifact.id, {
            path: 'publish-output',
            findBy: {
                token: OctoKit_1.myToken,
                workflowRunId: (_b = publishArtifact === null || publishArtifact === void 0 ? void 0 : publishArtifact.workflow_run) === null || _b === void 0 ? void 0 : _b.id,
                repositoryName: params.repo,
                repositoryOwner: 'Presight-AI'
            }
        });
        return getEnvFile();
    }
});
exports.getArtifactData = getArtifactData;
