"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubContext = exports.octokit = exports.myToken = void 0;
const core_1 = require("@actions/core");
const rest_1 = require("@octokit/rest");
const github = require("@actions/github");
(0, core_1.info)('Initializing...');
exports.myToken = process.env.MY_TOKEN || process.env.GITHUB_TOKEN || '';
(0, core_1.info)(`Token acquired: ${exports.myToken}`);
exports.octokit = new rest_1.Octokit({
    auth: exports.myToken
});
exports.githubContext = github.context;
