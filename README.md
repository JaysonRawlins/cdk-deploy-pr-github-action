# @jjrawlins/cdk-deploy-pr-github-action

A [projen](https://projen.io/) construct that generates GitHub Actions workflows for AWS CDK deployments.

## Features

- **Automated deploy pipeline** (`deploy.yml`) — synth, publish assets, and deploy on push to main
- **Manual dispatch workflow** (`deploy-dispatch.yml`) — deploy any previously published version to any environment
- **Versioned cloud assemblies** — publishes `cdk.out` to GitHub Packages with auto-incrementing versions
- **GitHub Releases** — each deploy creates a git tag and GitHub Release tied to the assembly version
- **Multi-stage deployments** — parallel or sequential stages with `dependsOn` ordering
- **GitHub Environments** — per-stage environment protection rules, secrets scoping, and deployment approvals
- **Manual approval stages** — exclude stages from auto-deploy, only deployable via dispatch
- **Per-stage IAM role overrides** — cross-account deployments with per-stage OIDC roles
- **Concurrency groups** — prevents concurrent deployments to the same stage
- **Rollback support** — redeploy any previous assembly version via the dispatch workflow

## Installation

```bash
npm install @jjrawlins/cdk-deploy-pr-github-action
```

Also available on [PyPI](https://pypi.org/project/jjrawlins-cdk-deploy-pr-github-action/), [NuGet](https://www.nuget.org/packages/JJRawlins.CdkDeployPrGithubAction), and [Go](https://pkg.go.dev/github.com/JaysonRawlins/cdk-deploy-pr-github-action).

## Usage

In your `.projenrc.ts`:

```typescript
import { CdkDeployPipeline } from '@jjrawlins/cdk-deploy-pr-github-action';

new CdkDeployPipeline(project, {
  stackPrefix: 'MyApp',
  pkgNamespace: '@my-org',
  iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubActionsOidcRole',
  iamRoleRegion: 'us-east-1',
  stages: [
    {
      name: 'dev',
      env: { account: '222222222222', region: 'us-east-1' },
      environment: 'development',
    },
    {
      name: 'staging',
      env: { account: '333333333333', region: 'us-east-1' },
      environment: 'staging',
      dependsOn: ['dev'],
    },
    {
      name: 'prod',
      env: { account: '444444444444', region: 'us-east-1' },
      environment: 'production',
      dependsOn: ['staging'],
      manualApproval: true, // Only deployable via dispatch
    },
  ],
});
```

Run `npx projen` to generate the workflow files.

## Generated Workflows

### `deploy.yml`

Triggered on push to main. Jobs:

1. **synth** — checks out code, installs dependencies, runs `cdk synth`, uploads cloud assembly artifact
2. **publish-assets** — publishes Lambda/container assets to AWS, versions and publishes the cloud assembly to GitHub Packages, creates a git tag and GitHub Release
3. **deploy-{stage}** — one job per non-manual stage, deploys stacks using the cloud assembly artifact

### `deploy-dispatch.yml`

Triggered manually via `workflow_dispatch`. Inputs:

- **environment** — target environment (dropdown of configured stages)
- **version** — assembly version to deploy (e.g., `0.0.4`)

Downloads the specified assembly version from GitHub Packages and deploys it. This enables:

- Deploying to `manualApproval` stages (e.g., production)
- Rolling back to any previous version
- Ad-hoc deployments outside the normal CI/CD flow

## Options

### `CdkDeployPipelineOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pkgNamespace` | `string` | *required* | npm scope for assembly packages (e.g., `@my-org`) |
| `stackPrefix` | `string` | *required* | Stack name prefix (e.g., `MyApp` -> `MyApp-dev`) |
| `iamRoleArn` | `string` | *required* | Default OIDC role ARN for AWS credential assumption |
| `stages` | `DeployStageOptions[]` | *required* | Deployment stages |
| `iamRoleRegion` | `string` | `us-east-1` | Default AWS region for OIDC credential assumption |
| `nodeVersion` | `string` | `24.x` | Node.js version for workflow runners |
| `cdkCommand` | `string` | `npx cdk` | CDK CLI command prefix |
| `installCommand` | `string` | `yarn install --check-files --frozen-lockfile` | Package install command |
| `manualDeployment` | `boolean` | `true` | Generate the dispatch workflow |
| `useGithubPackagesForAssembly` | `boolean` | `true` | Publish cloud assembly to GitHub Packages |
| `branchName` | `string` | `main` | Branch that triggers deployments |

### `DeployStageOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | *required* | Stage name (used in job IDs and stack names) |
| `env` | `{ account, region }` | *required* | AWS target environment |
| `environment` | `string` | stage name | GitHub Environment name |
| `iamRoleArn` | `string` | pipeline default | Override OIDC role for this stage |
| `iamRoleRegion` | `string` | pipeline default | Override AWS region for this stage |
| `dependsOn` | `string[]` | `[]` | Stages that must complete first |
| `stacks` | `string[]` | `['{stackPrefix}-{name}']` | CDK stack names to deploy |
| `manualApproval` | `boolean` | `false` | Exclude from auto-deploy, dispatch only |

## Examples

### Parallel stages

Stages without `dependsOn` run in parallel after asset publishing:

```typescript
stages: [
  { name: 'us-east-1', env: usEast1Env },
  { name: 'eu-west-1', env: euWest1Env },
]
```

### Cross-account with per-stage roles

```typescript
stages: [
  {
    name: 'dev',
    env: { account: '222222222222', region: 'us-east-1' },
    iamRoleArn: 'arn:aws:iam::222222222222:role/DevDeployRole',
  },
  {
    name: 'prod',
    env: { account: '333333333333', region: 'us-east-1' },
    iamRoleArn: 'arn:aws:iam::333333333333:role/ProdDeployRole',
    manualApproval: true,
  },
]
```

### Rolling back

Each deploy creates a GitHub Release with the assembly version. To roll back:

```bash
gh workflow run deploy-dispatch.yml -f environment=production -f version=0.0.3
```

## Prerequisites

- AWS OIDC identity provider configured for GitHub Actions
- IAM role with trust policy for GitHub Actions OIDC
- GitHub Environments configured for deployment protection rules (optional)

## License

Apache-2.0
