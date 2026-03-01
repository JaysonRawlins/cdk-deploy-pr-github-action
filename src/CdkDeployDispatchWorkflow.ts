import { GitHub, GithubWorkflow } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { DeployDispatchInternalOptions } from './CdkDeployPipeline';
import { toKebabCase } from './utils';

const CHECKOUT_VERSION = 'v5';
const SETUP_NODE_VERSION = 'v5';
const AWS_CREDENTIALS_VERSION = 'v5';

/**
 * Generates a workflow_dispatch workflow for manual CDK deployments and rollbacks.
 *
 * Allows deploying any previously published version of the cloud assembly
 * to any configured environment. This enables:
 * - Manual promotion between environments
 * - Rollback to any previous version
 * - Ad-hoc deployments outside the normal CI/CD flow
 */
export class CdkDeployDispatchWorkflow {
  constructor(project: any, options: DeployDispatchInternalOptions) {
    const {
      stages,
      pkgNamespace,
      appName,
      stackPrefix,
      iamRoleArn,
      iamRoleRegion,
      nodeVersion,
      cdkCommand,
      installCommand,
      workingDirectory,
    } = options;

    const defaults = workingDirectory ? { run: { 'working-directory': workingDirectory } } : undefined;

    const gh = project.github ?? new GitHub(project);
    const workflow = new GithubWorkflow(gh, 'deploy-dispatch', {
      fileName: 'deploy-dispatch.yml',
    });

    // Build environment choices from stages
    const environmentChoices = stages.map(
      (s) => s.environment ?? s.name,
    );

    workflow.on({
      workflowDispatch: {
        inputs: {
          environment: {
            description: 'Target environment to deploy to',
            required: true,
            type: 'choice',
            options: environmentChoices,
          },
          version: {
            description: 'Assembly version to deploy (e.g., 1.3.4)',
            required: true,
            type: 'string',
          },
        },
      },
    });

    const jobs: Record<string, any> = {};

    for (const stage of stages) {
      const jobId = `deploy-${toKebabCase(stage.name)}`;
      const stacks = stage.stacks ?? [`${stackPrefix}-${stage.name}`];
      const githubEnv = stage.environment ?? stage.name;
      const roleArn = stage.iamRoleArn ?? iamRoleArn;
      const roleRegion =
        stage.iamRoleRegion ?? iamRoleRegion ?? stage.env.region;

      const deployCommand = stacks
        .map((s) => `${cdkCommand} deploy ${s} --require-approval never --app cdk.out`)
        .join(' && ');

      jobs[jobId] = {
        name: `Deploy ${stage.name} (manual)`,
        if: `github.event.inputs.environment == '${githubEnv}'`,
        runsOn: ['ubuntu-latest'],
        ...(defaults && { defaults }),
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
            name: 'Download versioned assembly',
            run: `npm pack ${pkgNamespace}/${appName}@\${{ github.event.inputs.version }} --registry=https://npm.pkg.github.com && tar -xzf *.tgz && mv package cdk.out`,
            env: { NODE_AUTH_TOKEN: '${{ secrets.GITHUB_TOKEN }}', GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
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
    }

    workflow.addJobs(jobs);
  }
}
