import {info} from '@actions/core'
import {Octokit} from '@octokit/rest'
import * as github from '@actions/github'

info('Initializing...')
export const myToken = process.env.MY_TOKEN || process.env.GITHUB_TOKEN || ''

export const octokit = new Octokit({
  auth: myToken
})

export const githubContext = {
  owner: process.env.MY_OWNER || github.context.repo.owner || '',
  repo: process.env.MY_REPO || github.context.repo.repo || '',
  pull_number: parseInt(`${process.env.MY_PR_NUMBER}`, 10) || github.context.issue.number,

}

export const artifactName = process.env.MY_ARTIFACT_NAME || 'publish-output'
