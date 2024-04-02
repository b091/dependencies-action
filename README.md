# PR Dependency Check Action

This GitHub Action enforces PR dependencies as stated in a PR's opening comment.

The bot parses the first comment of a PR looking for the key phrases "depends on" or "blocked by" followed by an issue number specified by `#` and the issue or PR number (e.g. `#5`).

## Supported link styles

The action can detect links in the following styles:

- Quick Link: `#5`
- Partial Link: `b091/pr-dependencies-action#5`
- Partial URL: `b091/pr-dependencies-action/pull/5`
- Full URL: `https://github.com/b091/pr-dependencies-action/pull/5`
- Markdown: `[markdown link](https://github.com/b091/pr-dependencies-action/pull/5)`

Works for both issues and PRs!

Also supports custom domains for use with GitHub Enterprise!

## See it in action:

- [PR to be landed first](http://github.com/b091/pr-dependencies-action/pull/4)
- [PR to be landed second](http://github.com/b091/pr-dependencies-action/pull/5)

## Example usage

Just add the following to a `.yml` file in your `.github/workflows/` folder.

```yaml
on:
  pull_request_target: 
    types: [opened, edited, closed, reopened]

jobs:
  pr_dependencies:
    runs-on: ubuntu-latest
    name: "Check PR Dependencies"
    steps:
    - uses: b091/pr-dependencies-action@main
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
