import {getInput, info} from '@actions/core'
import {githubContext} from './OctoKit'

export interface PullRequestMatches {
  owner: string
  repo: string
  pull_number: number
}

const customDomains = getInput('custom-domains')?.split(/(\s+)/) ?? []

const keyPhrases = 'depends on|blocked by'
const issueTypes = 'issues|pull'
const domainsList = ['github.com'].concat(customDomains) // add others from parameter
const domainsString = combineDomains(domainsList)

const quickLinkRegex = new RegExp(`(${keyPhrases}) #(\\d+)`, 'gmi')
const partialLinkRegex = new RegExp(`(${keyPhrases}) ([-_\\w]+)\\/([-._a-z0-9]+)(#)(\\d+)`, 'gmi')
const partialUrlRegex = new RegExp(`(${keyPhrases}) ([-_\\w]+)\\/([-._a-z0-9]+)\\/(${issueTypes})\\/(\\d+)`, 'gmi')
const fullUrlRegex = new RegExp(`(${keyPhrases}) https?:\\/\\/(?:${domainsString})\\/([-_\\w]+)\\/([-._a-z0-9]+)\\/(${issueTypes})\\/(\\d+)`, 'gmi')
const markdownRegex = new RegExp(`(${keyPhrases}) \\[.*\\]\\(https?:\\/\\/(?:${domainsString})\\/([-_\\w]+)\\/([-._a-z0-9]+)\\/(${issueTypes})\\/(\\d+)\\)`, 'gmi')

function escapeDomainForRegex(domain: string) {
  return domain.replace('.', '\\.')
}

function combineDomains(domains: string[]) {
  return domains.map(x => escapeDomainForRegex(x)).join('|')
}

function extractFromMatch(match: string[]) {
  return {
    owner: match[2],
    repo: match[3],
    pull_number: parseInt(match[5], 10)
  }
}

export function getAllDependencies(body: string) {
  const allMatches: PullRequestMatches[] = []
  const quickLinkMatches = [...body.matchAll(quickLinkRegex)]
  if (quickLinkMatches.length !== 0) {
    quickLinkMatches.forEach(match => {
      info(`  Found number-referenced dependency in '${match}'`)
      allMatches.push({
        owner: githubContext.owner,
        repo: githubContext.repo,
        pull_number: parseInt(match[2], 10)
      })
    })
  }

  const extractableMatches = [...body.matchAll(partialLinkRegex)]
    .concat([...body.matchAll(partialUrlRegex)])
    .concat([...body.matchAll(fullUrlRegex)])
    .concat([...body.matchAll(markdownRegex)])

  if (extractableMatches.length !== 0) {
    extractableMatches.forEach(match => {
      info(`  Found number-referenced dependency in '${match}'`)
      allMatches.push(extractFromMatch(match))
    })
  }

  return allMatches
}
