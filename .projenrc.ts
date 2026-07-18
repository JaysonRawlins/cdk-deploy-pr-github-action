import { awscdk, DependencyType, TextFile, YamlFile } from 'projen';
import { Dependabot, DependabotScheduleInterval, GithubCredentials, VersioningStrategy } from 'projen/lib/github';
import { NodePackageManager, NpmAccess } from 'projen/lib/javascript';

const cdkCliVersion = '2.1029.2';
const minNodeVersion = '20.0.0';
const devNodeVersion = '24.8.0';
const workflowNodeVersion = '24.x';
const jsiiVersion = '^5.8.0';
const cdkVersion = '2.85.0'; // Minimum CDK Version Required
const minProjenVersion = '0.99.52'; // Bumped to pick up Dependabot.cooldown option (PR #4650, 2026-04-10).
const minConstructsVersion = '10.0.5'; // Minimum version to support CDK v2 and does affect consumers of the library
const devConstructsVersion = '10.0.5'; // Pin for local dev/build to avoid jsii type conflicts
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Jayson Rawlins',
  description: 'A projen construct that generates GitHub Actions workflows for CDK deployments with GitHub Environments, parallel stages, versioned assemblies, and manual rollback.',
  authorAddress: 'JaysonJ.Rawlins@gmail.com',
  keywords: [
    'aws',
    'cdk',
    'github',
    'action',
    'deploy',
    'pipeline',
    'github-environments',
  ],
  packageName: '@jjrawlins/cdk-deploy-pr-github-action',
  cdkVersion: cdkVersion,
  cdkCliVersion: cdkCliVersion,
  minNodeVersion: minNodeVersion,
  workflowNodeVersion: workflowNodeVersion,
  projenVersion: minProjenVersion,
  defaultReleaseBranch: 'main',
  license: 'Apache-2.0',
  jsiiVersion: jsiiVersion,
  name: '@jjrawlins/cdk-deploy-pr-github-action',
  npmAccess: NpmAccess.PUBLIC,
  projenrcTs: true,
  packageManager: NodePackageManager.PNPM,
  pnpmVersion: '11.13.0',
  repositoryUrl: 'https://github.com/JaysonRawlins/cdk-deploy-pr-github-action.git',
  githubOptions: {
    projenCredentials: GithubCredentials.fromApp({
      appIdSecret: 'PROJEN_APP_ID',
      privateKeySecret: 'PROJEN_APP_PRIVATE_KEY',
    }),
    mergify: false,
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: [
          'feat',
          'fix',
          'docs',
          'style',
          'refactor',
          'perf',
          'test',
          'chore',
          'revert',
          'ci',
          'build',
          'deps',
          'wip',
          'release',
        ],
      },
    },
  },
  // Dependency upgrades are handled by Dependabot (lockfile-only + cooldown).
  depsUpgrade: false,

  // Frozen-lockfile in CI so Dependabot lockfile-only PRs don't trigger
  // cosmetic self-mutation.
  buildWorkflowOptions: {
    mutableBuild: false,
  },

  // Aikido Safe-Chain 1.5.3 — in-flight malware scanner pinned to a release
  // tag. Bumps are a deliberate .projenrc.ts edit.
  workflowBootstrapSteps: [
    {
      name: 'Install Aikido Safe-Chain 1.5.3 (in-flight malware scanner, 7d minimum age)',
      run: [
        'echo "SAFE_CHAIN_MINIMUM_PACKAGE_AGE_HOURS=168" >> $GITHUB_ENV',
        'curl -fsSL https://github.com/AikidoSec/safe-chain/releases/download/1.5.3/install-safe-chain.sh | sh -s -- --ci',
      ].join('\n'),
    },
  ],
  publishToNuget: {
    packageId: 'JJRawlins.CdkDeployPrGithubAction',
    dotNetNamespace: 'JJRawlins.CdkDeployPrGithubAction',
    trustedPublishing: true,
  },
  publishToPypi: {
    distName: 'jjrawlins-cdk-deploy-pr-github-action',
    module: 'jjrawlins_cdk_deploy_pr_github_action',
    trustedPublishing: true,
  },
  publishToGo: {
    moduleName: 'github.com/JaysonRawlins/cdk-deploy-pr-github-action',
    packageName: 'cdkdeployprgithubaction',
    // Same-repo publish: the workflow's own token suffices — no PAT/App token.
    githubTokenSecret: 'GITHUB_TOKEN',
    // Dedicated branch: go resolution works off tags; main's required build
    // check (require-build-green ruleset) would reject publib's direct push.
    gitBranch: 'go',
  },
  peerDeps: [
    `aws-cdk-lib@>=${cdkVersion} <3.0.0`,
    `constructs@>=${minConstructsVersion} <11.0.0`,
  ],
  deps: [],
  devDeps: [
    `aws-cdk@${cdkCliVersion}`,
    `aws-cdk-lib@${cdkVersion}`,
    '@types/node',
    'projen',
  ],
  bundledDeps: [],
  gitignore: [
    '~*.yml',
  ],
  eslint: true,
  npmTrustedPublishing: true,
});

// Add Yarn resolutions to ensure patched transitive versions
project.package.addField('resolutions', {
  // Exact CVE/cooldown pins removed: pnpm's minimumReleaseAge
  // (pnpm-workspace.yaml) age-gates the whole tree at resolution time.
  'form-data': '^4.0.4',
  'aws-cdk-lib': `>=${cdkVersion} <3.0.0`,
  // Pin constructs for local dev/build to a single version to avoid jsii conflicts
  'constructs': devConstructsVersion,
});

// Allow Node 20+ for consumers (CDK constructs work on any modern Node).
project.package.addField('engines', {
  node: `>=${minNodeVersion}`,
});

// Ensure 'constructs' is only a peer dependency (avoid duplicates that cause jsii conflicts)
project.deps.removeDependency('constructs');
project.deps.addDependency(`constructs@>=${minConstructsVersion} <11.0.0`, DependencyType.PEER);


/**
 * For the build job, we need to be able to read from packages and also need id-token permissions for OIDC to authenticate to the registry.
 */
project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.build.permissions.id-token', 'write');
project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.build.permissions.packages', 'read');

/**
 * For the package jobs, we need to be able to write to packages and also need id-token permissions for OIDC to authenticate to the registry.
 * We also override node-version since the default minNodeVersion (20.0.0) is too old for @eslint/plugin-kit.
 */
project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.package-js.permissions.id-token', 'write');
project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.package-js.permissions.packages', 'write');

project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.package-python.permissions.packages', 'write');
project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.package-python.permissions.id-token', 'write');

project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.package-go.permissions.packages', 'write');
project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.package-go.permissions.id-token', 'write');

project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.package-dotnet.permissions.packages', 'write');
project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.package-dotnet.permissions.id-token', 'write');

/** For the release jobs */
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release.permissions.id-token', 'write');
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release.permissions.packages', 'read');
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release.permissions.contents', 'write');

project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_npm.permissions.id-token', 'write');
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_npm.permissions.packages', 'read');
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_npm.permissions.contents', 'write');

project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_pypi.permissions.id-token', 'write');
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_pypi.permissions.packages', 'read');
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_pypi.permissions.contents', 'write');

project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_golang.permissions.id-token', 'write');
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_golang.permissions.packages', 'read');
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_golang.permissions.contents', 'write');

project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_nuget.permissions.id-token', 'write');
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_nuget.permissions.packages', 'read');
project.github!.tryFindWorkflow('release')!.file!.addOverride('jobs.release_nuget.permissions.contents', 'write');

const releaseWorkflow = project.github!.tryFindWorkflow('release')!;
// publib pushes via `https://<GITHUB_TOKEN>@github.com`; installation tokens
// only authenticate as `x-access-token:<token>` userinfo. Rewrite inside git
// via env-based config at the JOB level — immune to step-index drift, and no
// App token needed for a same-repo push. (The old steps.10/11 surgery would
// have corrupted the job once pnpm's setup step shifted indices.)
releaseWorkflow.file!.addOverride('jobs.release_golang.env.GIT_CONFIG_COUNT', '1');
releaseWorkflow.file!.addOverride('jobs.release_golang.env.GIT_CONFIG_KEY_0', 'url.https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/.insteadOf');
releaseWorkflow.file!.addOverride('jobs.release_golang.env.GIT_CONFIG_VALUE_0', 'https://${{ secrets.GITHUB_TOKEN }}@github.com/');

// =========================================================================
// Security baseline — see ../.claude/projen-security-baseline.ts for the
// source-of-truth pattern. Replaces the prior dependency-review workflow
// with the JaysonRawlins/.github reusable osv-scanner gate.
// =========================================================================

// SHA-pin third-party actions used in pull_request_target contexts.
const prLintWorkflow = project.github!.tryFindWorkflow('pull-request-lint');
if (prLintWorkflow) {
  prLintWorkflow.file!.addOverride(
    'jobs.validate.steps.0.uses',
    'amannn/action-semantic-pull-request@48f256284bd46cdaab1048c3721360e808335d50', // v6.1.1
  );
}

// Dependabot — lockfile-only, patch+minor only, cooldown before PRs open.
const dependabot = new Dependabot(project.github!, {
  scheduleInterval: DependabotScheduleInterval.WEEKLY,
  versioningStrategy: VersioningStrategy.LOCKFILE_ONLY,
  labels: ['dependencies'],
  openPullRequestsLimit: 10,
  cooldown: {
    defaultDays: 7,
    semverMinorDays: 7,
    // Keep every cooldown >= the pnpm minimumReleaseAge gate (7d)
    // (dependabot-core#13165): with cooldown >= gate, PRs are born age-clean.
    semverPatchDays: 7,
    include: ['*'],
  },
  groups: {
    'aws-sdk': { patterns: ['@aws-sdk/*', '@smithy/*'] },
    'typescript-eslint': { patterns: ['@typescript-eslint/*'] },
  },
});

dependabot.config.updates[0].ignore = [
  { 'dependency-name': 'projen' },
  { 'dependency-name': '*', 'update-types': ['version-update:semver-major'] },
];

dependabot.config.updates.push({
  'package-ecosystem': 'github-actions',
  'directory': '/',
  'schedule': { interval: 'weekly' },
  'open-pull-requests-limit': 0,
  'labels': ['dependencies', 'github-actions'],
});

// OSV-scanner reusable workflow gate (replaces dependency-review).
new YamlFile(project, 'pnpm-workspace.yaml', {
  obj: {
    // 7d age gate applied at RESOLUTION time — covers transitives, the gap
    // Dependabot's cooldown can't close. Must stay <= every Dependabot
    // cooldown or bump PRs can't resolve.
    minimumReleaseAge: 10080,
    // Flat node_modules for jsii packaging (uniform baseline).
    nodeLinker: 'hoisted',
    allowBuilds: {
      // Transitive of eslint-import-resolver-typescript; ships prebuilt
      // binaries, its build script is an unneeded fallback.
      'unrs-resolver': false,
    },
  },
});

// Two-witness on the age gate: verify the ARTIFACT (registry publish date of
// every resolved version), not the resolver that produced it.
const auditTask = project.addTask('audit:lockfile-age', {
  exec: 'node .github/scripts/audit-lockfile-age.mjs pnpm-lock.yaml 168',
  description: 'Verify every pnpm-lock.yaml entry is at least 168h old on the registry',
});
project.buildWorkflow?.addPostBuildSteps({
  name: 'Audit lockfile age',
  run: `npx projen ${auditTask.name}`,
});

new YamlFile(project, '.github/workflows/security.yml', {
  obj: {
    name: 'security',
    on: { pull_request: {}, workflow_dispatch: {} },
    jobs: {
      security: { uses: 'JaysonRawlins/.github/.github/workflows/security.yml@main' },
    },
  },
});

// Semgrep SAST.
new YamlFile(project, '.github/workflows/semgrep.yml', {
  obj: {
    name: 'Semgrep',
    on: {
      push: { branches: ['main'] },
      pull_request: { branches: ['main'] },
    },
    permissions: { 'contents': 'read', 'security-events': 'write' },
    jobs: {
      scan: {
        'name': 'Scan',
        'runs-on': 'ubuntu-latest',
        'container': {
          image: 'semgrep/semgrep@sha256:9349edbadf90c3f3c0c3f55867625354e89680e6fa10d9034042af52fdb0e0d0',
        },
        'steps': [
          { uses: 'actions/checkout@v4' },
          {
            name: 'Run Semgrep',
            run: [
              'semgrep scan \\',
              '  --config=p/security-audit \\',
              '  --config=p/typescript \\',
              '  --config=p/javascript \\',
              '  --config=p/nodejs \\',
              '  --sarif --output=semgrep.sarif \\',
              '  || true',
            ].join('\n'),
          },
          {
            'name': 'Upload SARIF',
            'if': "always() && hashFiles('semgrep.sarif') != ''",
            'continue-on-error': true,
            'uses': 'github/codeql-action/upload-sarif@f411752efdf656cb71aa17b755b22c890960da1d', // v3.35.5
            'with': { sarif_file: 'semgrep.sarif' },
          },
        ],
      },
    },
  },
});

// Dependabot auto-merge for patch+minor.
new YamlFile(project, '.github/workflows/dependabot-automerge.yml', {
  obj: {
    name: 'dependabot-automerge',
    on: {
      pull_request_target: {
        types: ['opened', 'synchronize', 'reopened', 'ready_for_review'],
      },
    },
    permissions: { 'contents': 'write', 'pull-requests': 'write' },
    jobs: {
      automerge: {
        'runs-on': 'ubuntu-latest',
        'if': "github.actor == 'dependabot[bot]'",
        'steps': [
          {
            name: 'Get Dependabot metadata',
            id: 'metadata',
            uses: 'dependabot/fetch-metadata@21025c705c08248db411dc16f3619e6b5f9ea21a', // v2.5.0
            with: { 'github-token': '${{ secrets.GITHUB_TOKEN }}' },
          },
          {
            name: 'Enable auto-merge for safe Dependabot PRs',
            if: "steps.metadata.outputs.update-type == 'version-update:semver-patch' || steps.metadata.outputs.update-type == 'version-update:semver-minor'",
            run: 'gh pr merge --auto --squash "$PR_URL"',
            env: {
              PR_URL: '${{ github.event.pull_request.html_url }}',
              GH_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
            },
          },
        ],
      },
    },
  },
});

// Scheduled unblocker for stuck Dependabot PRs (Aikido cooldown false-fails).
new YamlFile(project, '.github/workflows/dependabot-rebase-stuck.yml', {
  obj: {
    name: 'dependabot-unblocker',
    on: {
      schedule: [{ cron: '0 9 * * 1' }],
      workflow_dispatch: {},
    },
    permissions: { 'pull-requests': 'read', 'actions': 'write' },
    jobs: {
      unblock: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          {
            name: 'Rerun failed build on Aikido-cooldown-blocked Dependabot PRs',
            env: {
              GH_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
              REPO: '${{ github.repository }}',
            },
            run: [
              'set -euo pipefail',
              '',
              'stuck=$(gh pr list --repo "$REPO" \\',
              '  --author "app/dependabot" \\',
              '  --state open \\',
              '  --json number,statusCheckRollup \\',
              '  --jq \'.[] | select([.statusCheckRollup[] | select(.name == "build")] | any(.conclusion == "FAILURE")) | .number\')',
              '',
              'if [ -z "$stuck" ]; then',
              '  echo "No stuck Dependabot PRs."',
              '  exit 0',
              'fi',
              '',
              'for pr in $stuck; do',
              '  run_id=$(gh pr view "$pr" --repo "$REPO" --json statusCheckRollup \\',
              '    --jq \'.statusCheckRollup[] | select(.name == "build") | .detailsUrl\' \\',
              '    | grep -oE "/runs/[0-9]+" | head -1 | cut -d/ -f3)',
              '',
              '  if [ -z "$run_id" ]; then',
              '    echo "PR #$pr: no build run id, skipping"',
              '    continue',
              '  fi',
              '',
              '  log=$(gh run view "$run_id" --repo "$REPO" --log-failed 2>&1 || true)',
              '',
              '  if echo "$log" | grep -q "minimum package age"; then',
              '    echo "PR #$pr: Aikido cooldown block — rerunning failed build (preserves lockfile)"',
              '    gh run rerun "$run_id" --repo "$REPO" --failed',
              '  elif echo "$log" | grep -q "Safe-chain: blocked"; then',
              '    echo "PR #$pr: Aikido blocked (non-age, possibly malware) — leaving for human review"',
              '  else',
              '    echo "PR #$pr: build failed for unrecognized reason — leaving for human review"',
              '  fi',
              'done',
            ].join('\n'),
          },
        ],
      },
    },
  },
});

new TextFile(project, '.tool-versions', {
  lines: [
    '# ~~ Generated by projen. To modify, edit .projenrc.ts and run "npx projen".',
    `nodejs ${devNodeVersion}`,
  ],
});

// Allow importing projen from devDependencies in source files.
// projen is a build-time dependency (consumers provide their own projen).
project.eslint?.addOverride({
  files: ['src/**/*.ts'],
  rules: {
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
      optionalDependencies: false,
      peerDependencies: true,
    }],
  },
});

// Projen creates this incorrectly
// Removing to keep linter happy
project.compileTask.exec('rm -r tsconfig.json');

project.synth();
