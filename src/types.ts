/**
 * AWS environment target for a deployment stage.
 */
export interface AwsEnvironment {
  /** AWS account ID */
  readonly account: string;
  /** AWS region */
  readonly region: string;
}

/**
 * Configuration for a single deployment stage.
 */
export interface DeployStageOptions {
  /** Stage name (used as suffix in job IDs and stack names, e.g., 'Sandbox', 'Production') */
  readonly name: string;

  /** AWS target environment (account + region) */
  readonly env: AwsEnvironment;

  /**
   * GitHub Environment name for protection rules, secrets scoping, and deployment approvals.
   * @default - uses the stage name
   */
  readonly environment?: string;

  /**
   * Override the default OIDC role ARN for this stage.
   * Useful for cross-account deployments where each account has its own role.
   */
  readonly iamRoleArn?: string;

  /**
   * Override the default AWS region for OIDC credential assumption.
   * @default - uses the pipeline-level iamRoleRegion or the stage env.region
   */
  readonly iamRoleRegion?: string;

  /**
   * Stage names that must complete successfully before this stage runs.
   * Stages with no dependsOn run in parallel after the publish-assets job.
   *
   * @example ['Sandbox', 'Dev'] // waits for both before deploying
   * @default - depends only on publish-assets (runs as soon as assets are ready)
   */
  readonly dependsOn?: string[];

  /**
   * Specific CDK stack names to deploy in this stage.
   * @default - ['{stackPrefix}-{stageName}']
   */
  readonly stacks?: string[];

  /**
   * When true, this stage is excluded from the automatic deploy.yml pipeline
   * and can only be deployed via the deploy-dispatch.yml workflow.
   *
   * Auto-deploy stages cannot depend on manual-approval stages.
   *
   * @default false
   */
  readonly manualApproval?: boolean;
}

/**
 * Configuration for the CDK deploy pipeline.
 */
export interface CdkDeployPipelineOptions {
  /** npm scope for versioned cloud assembly packages (e.g., '@defiance-digital') */
  readonly pkgNamespace: string;

  /** Stack name prefix. Stage names are appended with a dash (e.g., 'MyApp' -> 'MyApp-Production') */
  readonly stackPrefix: string;

  /** Default OIDC role ARN for AWS credential assumption */
  readonly iamRoleArn: string;

  /**
   * Default AWS region for OIDC credential assumption.
   * @default 'us-east-1'
   */
  readonly iamRoleRegion?: string;

  /**
   * Node.js version for workflow runners.
   * @default '24.x'
   */
  readonly nodeVersion?: string;

  /**
   * CDK CLI command prefix.
   * @default 'npx cdk'
   */
  readonly cdkCommand?: string;

  /**
   * Package install command.
   * @default 'yarn install --check-files --frozen-lockfile'
   */
  readonly installCommand?: string;

  /** Deployment stages in declaration order */
  readonly stages: DeployStageOptions[];

  /**
   * Generate a workflow_dispatch workflow for manual deployments and rollbacks.
   * @default true
   */
  readonly manualDeployment?: boolean;

  /**
   * Version and publish cloud assembly to GitHub Packages for rollback support.
   * @default true
   */
  readonly useGithubPackagesForAssembly?: boolean;

  /**
   * Branch that triggers deployments on push.
   * @default 'main'
   */
  readonly branchName?: string;
}
