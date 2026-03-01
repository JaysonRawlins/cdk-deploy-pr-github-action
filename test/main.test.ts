import { awscdk } from 'projen';
import { synthSnapshot } from 'projen/lib/util/synth';
import { CdkDeployPipeline } from '../src';

function createApp(): awscdk.AwsCdkTypeScriptApp {
  return new awscdk.AwsCdkTypeScriptApp({
    name: 'test-app',
    defaultReleaseBranch: 'main',
    cdkVersion: '2.85.0',
    projenrcTs: false,
    github: true,
  } as any);
}

const sandboxEnv = { account: '111111111111', region: 'us-east-1' };
const devEnv = { account: '222222222222', region: 'us-east-1' };
const prodEnv = { account: '333333333333', region: 'us-east-1' };

describe('CdkDeployPipeline', () => {
  test('generates deploy.yml with synth, publish-assets, and deploy jobs', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv },
      ],
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    expect(workflow).toBeDefined();
    expect(workflow).toContain('Synthesize CDK application');
    expect(workflow).toContain('Publish assets to AWS');
    expect(workflow).toContain('Deploy Dev');
    expect(workflow).toContain('npx cdk synth');
    expect(workflow).toContain('npx cdk deploy TestApp-Dev');
  });

  test('parallel stages both depend on publish-assets', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Sandbox', env: sandboxEnv },
        { name: 'Dev', env: devEnv },
      ],
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    // Both deploy jobs should depend on publish-assets (not each other)
    expect(workflow).toContain('Deploy Sandbox');
    expect(workflow).toContain('Deploy Dev');
    // The needs array for both should reference publish-assets
    expect(workflow).toMatch(/deploy-sandbox:[\s\S]*?needs:[\s\S]*?publish-assets/);
    expect(workflow).toMatch(/deploy-dev:[\s\S]*?needs:[\s\S]*?publish-assets/);
  });

  test('stage with dependsOn waits for specified stages', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Sandbox', env: sandboxEnv },
        { name: 'Dev', env: devEnv },
        { name: 'Production', env: prodEnv, dependsOn: ['Sandbox', 'Dev'] },
      ],
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    expect(workflow).toContain('deploy-sandbox');
    expect(workflow).toContain('deploy-dev');
    expect(workflow).toContain('deploy-production');
    // Production needs both sandbox and dev
    expect(workflow).toMatch(/deploy-production:[\s\S]*?needs:[\s\S]*?deploy-sandbox/);
    expect(workflow).toMatch(/deploy-production:[\s\S]*?needs:[\s\S]*?deploy-dev/);
  });

  test('GitHub Environment field is set on deploy jobs', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv, environment: 'development' },
        { name: 'Production', env: prodEnv, environment: 'production', dependsOn: ['Dev'] },
      ],
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    expect(workflow).toContain('environment: development');
    expect(workflow).toContain('environment: production');
  });

  test('per-stage IAM role overrides', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/DefaultRole',
      stages: [
        {
          name: 'Dev',
          env: devEnv,
          iamRoleArn: 'arn:aws:iam::222222222222:role/DevRole',
        },
      ],
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    expect(workflow).toContain('arn:aws:iam::222222222222:role/DevRole');
  });

  test('concurrency groups are set per stage', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv },
      ],
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    expect(workflow).toContain('group: deploy-dev');
    expect(workflow).toContain('cancel-in-progress: false');
  });

  test('custom stack names', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv, stacks: ['CustomStack1', 'CustomStack2'] },
      ],
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    expect(workflow).toContain('CustomStack1');
    expect(workflow).toContain('CustomStack2');
  });

  test('throws on invalid dependsOn reference', () => {
    const app = createApp();
    expect(() => {
      new CdkDeployPipeline(app, {
        pkgNamespace: '@test-org',
        stackPrefix: 'TestApp',
        iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
        stages: [
          { name: 'Dev', env: devEnv, dependsOn: ['NonExistent'] },
        ],
      });
    }).toThrow(/depends on 'NonExistent', which is not a defined stage/);
  });

  test('throws on circular dependency', () => {
    const app = createApp();
    expect(() => {
      new CdkDeployPipeline(app, {
        pkgNamespace: '@test-org',
        stackPrefix: 'TestApp',
        iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
        stages: [
          { name: 'A', env: devEnv, dependsOn: ['B'] },
          { name: 'B', env: devEnv, dependsOn: ['A'] },
        ],
      });
    }).toThrow(/Circular dependency detected/);
  });

  test('throws on empty stages', () => {
    const app = createApp();
    expect(() => {
      new CdkDeployPipeline(app, {
        pkgNamespace: '@test-org',
        stackPrefix: 'TestApp',
        iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
        stages: [],
      });
    }).toThrow(/At least one deployment stage/);
  });

  test('generates deploy-dispatch.yml by default', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv, environment: 'development' },
        { name: 'Production', env: prodEnv, environment: 'production', dependsOn: ['Dev'] },
      ],
    });
    const out = synthSnapshot(app);
    const dispatch = out['.github/workflows/deploy-dispatch.yml'];
    expect(dispatch).toBeDefined();
    expect(dispatch).toContain('development');
    expect(dispatch).toContain('production');
    expect(dispatch).toContain('Assembly version to deploy');
    expect(dispatch).toContain("github.event.inputs.environment == 'development'");
    expect(dispatch).toContain("github.event.inputs.environment == 'production'");
  });

  test('does not generate deploy-dispatch.yml when manualDeployment is false', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv },
      ],
      manualDeployment: false,
    });
    const out = synthSnapshot(app);
    expect(out['.github/workflows/deploy-dispatch.yml']).toBeUndefined();
  });

  test('manualApproval stage is excluded from deploy.yml but present in deploy-dispatch.yml', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv, environment: 'development' },
        { name: 'Production', env: prodEnv, environment: 'production', manualApproval: true },
      ],
    });
    const out = synthSnapshot(app);
    const deploy = out['.github/workflows/deploy.yml'];
    const dispatch = out['.github/workflows/deploy-dispatch.yml'];

    // deploy.yml should have Dev but NOT Production
    expect(deploy).toContain('Deploy Dev');
    expect(deploy).not.toContain('Deploy Production');
    expect(deploy).not.toContain('deploy-production');

    // deploy-dispatch.yml should have both
    expect(dispatch).toContain('development');
    expect(dispatch).toContain('production');
  });

  test('throws when auto-deploy stage depends on manualApproval stage', () => {
    const app = createApp();
    expect(() => {
      new CdkDeployPipeline(app, {
        pkgNamespace: '@test-org',
        stackPrefix: 'TestApp',
        iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
        stages: [
          { name: 'Dev', env: devEnv, manualApproval: true },
          { name: 'Production', env: prodEnv, dependsOn: ['Dev'] },
        ],
      });
    }).toThrow(/Auto-deploy stages cannot depend on manual-approval stages/);
  });

  test('manualApproval stage with dependsOn is valid', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv, environment: 'development' },
        { name: 'Production', env: prodEnv, environment: 'production', dependsOn: ['Dev'], manualApproval: true },
      ],
    });
    const out = synthSnapshot(app);
    const deploy = out['.github/workflows/deploy.yml'];
    // Only Dev should be in deploy.yml
    expect(deploy).toContain('Deploy Dev');
    expect(deploy).not.toContain('deploy-production');
  });

  test('publishes assembly to GitHub Packages by default', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv },
      ],
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    expect(workflow).toContain('Publish assembly to GitHub Packages');
    expect(workflow).toContain('npm publish');
  });

  test('workingDirectory sets defaults.run.working-directory and adjusts artifact paths', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv },
      ],
      workingDirectory: 'infra',
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    expect(workflow).toContain('working-directory: infra');
    expect(workflow).toContain('path: infra/cdk.out/');
  });

  test('workingDirectory sets working-directory in deploy-dispatch.yml', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv, environment: 'development' },
      ],
      workingDirectory: 'infra',
    });
    const out = synthSnapshot(app);
    const dispatch = out['.github/workflows/deploy-dispatch.yml'];
    expect(dispatch).toContain('working-directory: infra');
  });

  test('deploy-dispatch npm pack uses GitHub Packages registry', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv, environment: 'development' },
      ],
    });
    const out = synthSnapshot(app);
    const dispatch = out['.github/workflows/deploy-dispatch.yml'];
    expect(dispatch).toContain('--registry=https://npm.pkg.github.com');
  });

  test('workingDirectory with trailing slash is normalized', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv },
      ],
      workingDirectory: 'infra/',
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    expect(workflow).toContain('working-directory: infra');
    expect(workflow).toContain('path: infra/cdk.out/');
    expect(workflow).not.toContain('infra//');
  });

  test('no workingDirectory does not add working-directory', () => {
    const app = createApp();
    new CdkDeployPipeline(app, {
      pkgNamespace: '@test-org',
      stackPrefix: 'TestApp',
      iamRoleArn: 'arn:aws:iam::111111111111:role/GitHubOidc',
      stages: [
        { name: 'Dev', env: devEnv },
      ],
    });
    const out = synthSnapshot(app);
    const workflow = out['.github/workflows/deploy.yml'];
    expect(workflow).not.toContain('working-directory');
  });
});
