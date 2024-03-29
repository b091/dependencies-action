import * as fs from 'fs'
import * as path from 'path'
import {config} from 'dotenv'
import {DefaultArtifactClient} from '@actions/artifact'
import {artifactName, myToken, octokit} from './OctoKit'
import {info} from '@actions/core'

const artifactPath = path.join('artifact')

interface ArtifactDataProps {
  owner: string
  repo: string
  pull_number: number
}

const artifactClient = new DefaultArtifactClient()

const getEnvFile = () => {
  const myData = {}
  config({
    path: `${artifactPath}/.env`,
    processEnv: myData
  })
  return myData
}

export const getArtifactData = async (params: ArtifactDataProps) => {
  const repoPullRequest = await octokit.rest.pulls.get({...params})
  const repoRuns = await octokit.actions.listWorkflowRunsForRepo({
    ...params,
    head_sha: repoPullRequest.data.head.sha
  })
  const repoRunArtifacts = await octokit.actions.listWorkflowRunArtifacts({
    ...params,
    run_id: repoRuns.data.workflow_runs[0].id,
    head_sha: repoPullRequest.data.head.sha,
    name: artifactName
  })

  const publishArtifact = repoRunArtifacts.data.artifacts.pop()

  if (publishArtifact?.workflow_run?.id && publishArtifact?.id) {
    fs.mkdir(artifactPath, () => info('Directory Created'))

    await artifactClient.downloadArtifact(publishArtifact.id, {
      path: artifactPath,
      findBy: {
        token: myToken,
        workflowRunId: publishArtifact?.workflow_run?.id,
        repositoryName: params.repo,
        repositoryOwner: params.owner
      }
    })

    return getEnvFile()
  }

  return {}
}
