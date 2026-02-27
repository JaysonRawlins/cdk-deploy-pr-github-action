import { GitHub, GithubWorkflow } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { CdkDeployDispatchWorkflow } from './CdkDeployDispatchWorkflow';
import { CdkDeployPipelineOptions, DeployStageOptions } from './types';
import { toKebabCase, validateNoCycles } from './utils';

const CHECKOUT_VERSION = 'v5';
const SETUP_NODE_VERSION = 'v5';
const AWS_CREDENTIALS_VERSION = 'v5';
const UPLOAD_ARTIFACT_VERSION = 'v4';
const DOWNLOAD_ARTIFACT_VERSION = 'v5';

/**
 * Generates GitHub Actions workflows for CDK deployments.
 *
 * Creates a `deploy.yml` workflow with:
 * - Synth job to compile and synthesize the CDK app
 * - Asset publish job to upload Lambda/container assets to AWS
 * - Per-stage deploy jobs with GitHub Environments, parallel execution, and concurrency groups
 *
 * Optionally creates a `deploy-dispatch.yml` workflow for manual deployments and rollbacks.
 */
export class CdkDeployPipeline {
  constructor(project: any, options: CdkDeployPipelineOptions) {
    const {
      pkgNamespace,
      stackPrefix,
      iamRoleArn,
      iamRoleRegion = 'us-east-1',
      nodeVersion = '24.x',
      cdkCommand = 'npx cdk',
      installCommand = 'yarn install --check-files --frozen-lockfile',
      stages,
      manualDeployment = true,
      useGithubPackagesForAssembly = true,
      branchName = 'main',
    } = options;

    // Validate inputs
    if (stages.length === 0) {
      throw new Error('At least one deployment stage must be defined');
    }

    const stageNames = new Set(stages.map((s) => s.name));
    for (const stage of stages) {
      if (stage.dependsOn) {
        for (const dep of stage.dependsOn) {
          if (!stageNames.has(dep)) {
            throw new Error(
              `Stage '${stage.name}' depends on '${dep}', which is not a defined stage. Available: ${[...stageNames].join(', ')}`,
            );
          }
          if (dep === stage.name) {
            throw new Error(`Stage '${stage.name}' cannot depend on itself`);
          }
        }
      }
    }

    // Validate that auto-deploy stages don't depend on manual-approval stages
    for (const stage of stages) {
      if (!stage.manualApproval && stage.dependsOn) {
        for (const dep of stage.dependsOn) {
          const depStage = stages.find((s) => s.name === dep);
          if (depStage?.manualApproval) {
            throw new Error(
              `Stage '${stage.name}' depends on '${dep}', which has manualApproval enabled. Auto-deploy stages cannot depend on manual-approval stages.`,
            );
          }
        }
      }
    }

    validateNoCycles(stages);

    if (useGithubPackagesForAssembly && !pkgNamespace) {
      throw new Error(
        'pkgNamespace is required when useGithubPackagesForAssembly is enabled',
      );
    }

    // Create the deploy workflow
    const gh = project.github ?? new GitHub(project);
    const workflow = new GithubWorkflow(gh, 'deploy', {
      fileName: 'deploy.yml',
    });

    workflow.on({
      push: { branches: [branchName] },
      workflowDispatch: {},
    });

    const appName = project.name ?? stackPrefix.toLowerCase();

    // Build jobs object
    const jobs: Record<string, any> = {};

    // --- Synth Job ---
    jobs.synth = {
      name: 'Synthesize CDK application',
      runsOn: ['ubuntu-latest'],
      permissions: {
        contents: JobPermission.READ,
        packages: JobPermission.READ,
      },
      env: { CI: 'true' },
      steps: [
        {
          name: 'Checkout',
          uses: `actions/checkout@${CHECKOUT_VERSION}`,
          with: { 'fetch-depth': 0 },
        },
        {
          name: 'Setup Node.js',
          uses: `actions/setup-node@${SETUP_NODE_VERSION}`,
          with: {
            'node-version': nodeVersion,
            'registry-url': 'https://npm.pkg.github.com',
          },
        },
        {
          name: 'Install dependencies',
          run: installCommand,
          env: { NODE_AUTH_TOKEN: '${{ secrets.GITHUB_TOKEN }}', GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
        },
        {
          name: 'Synth',
          run: `${cdkCommand} synth`,
        },
        {
          name: 'Upload cloud assembly',
          uses: `actions/upload-artifact@${UPLOAD_ARTIFACT_VERSION}`,
          with: {
            name: 'cloud-assembly',
            path: 'cdk.out/',
          },
        },
      ],
    };

    // --- Publish Assets Job ---
    const publishSteps: any[] = [
      {
        name: 'Checkout',
        uses: `actions/checkout@${CHECKOUT_VERSION}`,
        with: { 'fetch-depth': 0 },
      },
      {
        name: 'Setup Node.js',
        uses: `actions/setup-node@${SETUP_NODE_VERSION}`,
        with: {
          'node-version': nodeVersion,
          'registry-url': 'https://npm.pkg.github.com',
        },
      },
      {
        name: 'Install dependencies',
        run: installCommand,
        env: { NODE_AUTH_TOKEN: '${{ secrets.GITHUB_TOKEN }}', GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
      },
      {
        name: 'Download cloud assembly',
        uses: `actions/download-artifact@${DOWNLOAD_ARTIFACT_VERSION}`,
        with: { name: 'cloud-assembly', path: 'cdk.out/' },
      },
      {
        name: 'AWS Credentials',
        uses: `aws-actions/configure-aws-credentials@${AWS_CREDENTIALS_VERSION}`,
        with: {
          'role-to-assume': iamRoleArn,
          'role-session-name': 'GitHubAction',
          'aws-region': iamRoleRegion,
        },
      },
      {
        name: 'Publish assets',
        run: 'for manifest in $(find cdk.out -name "*-assets.json"); do npx cdk-assets publish -p "$manifest"; done',
      },
    ];

    if (useGithubPackagesForAssembly) {
      publishSteps.push(
        {
          name: 'Configure git identity',
          run: [
            'git config user.name "github-actions[bot]"',
            'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
          ].join('\n'),
        },
        {
          name: 'Create assembly package',
          run: [
            `PKG_NAME="${pkgNamespace}/${appName}"`,
            'LATEST=$(npm view "$PKG_NAME" version --registry=https://npm.pkg.github.com 2>/dev/null || echo "0.0.0")',
            `echo '${JSON.stringify({ name: `${pkgNamespace}/${appName}`, publishConfig: { registry: 'https://npm.pkg.github.com' } })}' | jq --arg v "$LATEST" '. + {version: $v}' > cdk.out/package.json`,
            'cd cdk.out && npm version --no-git-tag-version patch',
          ].join('\n'),
          env: { NODE_AUTH_TOKEN: '${{ secrets.GITHUB_TOKEN }}', GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
        },
        {
          name: 'Publish assembly to GitHub Packages',
          run: 'cd cdk.out && npm publish --registry=https://npm.pkg.github.com',
          env: { NODE_AUTH_TOKEN: '${{ secrets.GITHUB_TOKEN }}', GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
        },
      );
    }

    jobs['publish-assets'] = {
      name: 'Publish assets to AWS',
      needs: ['synth'],
      runsOn: ['ubuntu-latest'],
      permissions: {
        contents: JobPermission.WRITE,
        packages: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      env: { CI: 'true' },
      steps: publishSteps,
    };

    // --- Per-Stage Deploy Jobs ---
    for (const stage of stages) {
      if (stage.manualApproval) continue;
      const jobId = `deploy-${toKebabCase(stage.name)}`;
      const stacks =
        stage.stacks ?? [`${stackPrefix}-${stage.name}`];
      const githubEnv = stage.environment ?? stage.name;
      const roleArn = stage.iamRoleArn ?? iamRoleArn;
      const roleRegion =
        stage.iamRoleRegion ?? iamRoleRegion ?? stage.env.region;

      // Compute needs
      let needs: string[];
      if (stage.dependsOn && stage.dependsOn.length > 0) {
        needs = stage.dependsOn.map(
          (dep) => `deploy-${toKebabCase(dep)}`,
        );
      } else {
        needs = ['publish-assets'];
      }

      const deployCommand = stacks
        .map((s) => `${cdkCommand} deploy ${s} --require-approval never --app cdk.out`)
        .join(' && ');

      jobs[jobId] = {
        name: `Deploy ${stage.name}`,
        needs: needs,
        runsOn: ['ubuntu-latest'],
        environment: githubEnv,
        concurrency: {
          'group': `deploy-${toKebabCase(stage.name)}`,
          'cancel-in-progress': false,
        },
        permissions: {
          contents: JobPermission.READ,
          packages: JobPermission.READ,
          idToken: JobPermission.WRITE,
        },
        env: { CI: 'true' },
        steps: [
          {
            name: 'Checkout',
            uses: `actions/checkout@${CHECKOUT_VERSION}`,
          },
          {
            name: 'Setup Node.js',
            uses: `actions/setup-node@${SETUP_NODE_VERSION}`,
            with: {
              'node-version': nodeVersion,
              'registry-url': 'https://npm.pkg.github.com',
            },
          },
          {
            name: 'Install dependencies',
            run: installCommand,
            env: { NODE_AUTH_TOKEN: '${{ secrets.GITHUB_TOKEN }}', GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
          },
          {
            name: 'Download cloud assembly',
            uses: `actions/download-artifact@${DOWNLOAD_ARTIFACT_VERSION}`,
            with: { name: 'cloud-assembly', path: 'cdk.out/' },
          },
          {
            name: 'AWS Credentials',
            uses: `aws-actions/configure-aws-credentials@${AWS_CREDENTIALS_VERSION}`,
            with: {
              'role-to-assume': roleArn,
              'role-session-name': 'GitHubAction',
              'aws-region': roleRegion,
            },
          },
          {
            name: `Deploy ${stage.name}`,
            run: deployCommand,
          },
        ],
      };

      // Create projen task for local usage
      project.addTask(`deploy:${stage.name}`, {
        description: `Deploy to ${stage.name}`,
        exec: stacks
          .map((s) => `${cdkCommand} deploy ${s} --require-approval never`)
          .join(' && '),
      });
    }

    // Add all jobs to the workflow
    workflow.addJobs(jobs);

    // --- Dispatch Workflow ---
    if (manualDeployment && useGithubPackagesForAssembly) {
      new CdkDeployDispatchWorkflow(project, {
        stages,
        pkgNamespace,
        appName,
        stackPrefix,
        iamRoleArn,
        iamRoleRegion,
        nodeVersion,
        cdkCommand,
        installCommand,
      });
    }
  }
}

/**
 * Internal helper to build deploy dispatch workflow options from pipeline options.
 * Exported for use by CdkDeployDispatchWorkflow.
 */
export interface DeployDispatchInternalOptions {
  readonly stages: DeployStageOptions[];
  readonly pkgNamespace: string;
  readonly appName: string;
  readonly stackPrefix: string;
  readonly iamRoleArn: string;
  readonly iamRoleRegion: string;
  readonly nodeVersion: string;
  readonly cdkCommand: string;
  readonly installCommand: string;
}
