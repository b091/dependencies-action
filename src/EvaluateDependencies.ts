import {info, setFailed, setOutput} from '@actions/core'
import {getAllDependencies} from './BodyParser'
import {githubContext, octokit} from './OctoKit'
import {getArtifactData} from './Artifact'

interface PullRequestInfo {
  number: number
  title: string
  owner: string
  repo: string
  env: {[key: string]: string}
}

export const evaluate = async () => {
  try {
    const {data: pullRequest} = await octokit.rest.pulls.get(githubContext)

    if (!pullRequest.body) {
      info('Body empty')
      return
    }

    info('\nReading PR body...')

    const dependencies = getAllDependencies(pullRequest.body)

    if (dependencies.length === 0) {
      info('No pull request dependencies found')
      return
    }

    info('\nAnalyzing lines...')
    const relatedPullRequests: PullRequestInfo[] = []
    for (const pullRequestDependency of dependencies) {
      info(`  Fetching '${JSON.stringify(pullRequestDependency)}'`)
      const {data: pullRequest} = await octokit.rest.pulls.get({
        ...pullRequestDependency
      })

      if (!pullRequest) continue

      const env = await getArtifactData(pullRequestDependency)

      relatedPullRequests.push({
        owner: pullRequestDependency.owner,
        repo: pullRequestDependency.repo,
        number: pullRequest.number,
        title: pullRequest.title,
        env
      })
    }

    setOutput('PR_LIST', JSON.stringify(relatedPullRequests))

    relatedPullRequests.map(pullRequest => {
      info(`${pullRequest.title}`)
      info(`From: ${pullRequest.owner}/${pullRequest.repo}#${pullRequest.number}`)
      info(`Here is your ENV: ${JSON.stringify(pullRequest.env)}`)
    })
  } catch (e) {
    setFailed((e as Error)?.message)
    throw e
  }
}
