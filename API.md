# API Reference <a name="API Reference" id="api-reference"></a>


## Structs <a name="Structs" id="Structs"></a>

### AwsEnvironment <a name="AwsEnvironment" id="@jjrawlins/cdk-deploy-pr-github-action.AwsEnvironment"></a>

AWS environment target for a deployment stage.

#### Initializer <a name="Initializer" id="@jjrawlins/cdk-deploy-pr-github-action.AwsEnvironment.Initializer"></a>

```typescript
import { AwsEnvironment } from '@jjrawlins/cdk-deploy-pr-github-action'

const awsEnvironment: AwsEnvironment = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.AwsEnvironment.property.account">account</a></code> | <code>string</code> | AWS account ID. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.AwsEnvironment.property.region">region</a></code> | <code>string</code> | AWS region. |

---

##### `account`<sup>Required</sup> <a name="account" id="@jjrawlins/cdk-deploy-pr-github-action.AwsEnvironment.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

AWS account ID.

---

##### `region`<sup>Required</sup> <a name="region" id="@jjrawlins/cdk-deploy-pr-github-action.AwsEnvironment.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

AWS region.

---

### CdkDeployPipelineOptions <a name="CdkDeployPipelineOptions" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions"></a>

Configuration for the CDK deploy pipeline.

#### Initializer <a name="Initializer" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.Initializer"></a>

```typescript
import { CdkDeployPipelineOptions } from '@jjrawlins/cdk-deploy-pr-github-action'

const cdkDeployPipelineOptions: CdkDeployPipelineOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.iamRoleArn">iamRoleArn</a></code> | <code>string</code> | Default OIDC role ARN for AWS credential assumption. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | npm scope for versioned cloud assembly packages (e.g., '@defiance-digital'). |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | Stack name prefix. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.stages">stages</a></code> | <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions">DeployStageOptions</a>[]</code> | Deployment stages in declaration order. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.branchName">branchName</a></code> | <code>string</code> | Branch that triggers deployments on push. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.cdkCommand">cdkCommand</a></code> | <code>string</code> | CDK CLI command prefix. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.iamRoleRegion">iamRoleRegion</a></code> | <code>string</code> | Default AWS region for OIDC credential assumption. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.installCommand">installCommand</a></code> | <code>string</code> | Package install command. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.manualDeployment">manualDeployment</a></code> | <code>boolean</code> | Generate a workflow_dispatch workflow for manual deployments and rollbacks. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.nodeVersion">nodeVersion</a></code> | <code>string</code> | Node.js version for workflow runners. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.useGithubPackagesForAssembly">useGithubPackagesForAssembly</a></code> | <code>boolean</code> | Version and publish cloud assembly to GitHub Packages for rollback support. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.workingDirectory">workingDirectory</a></code> | <code>string</code> | Working directory for the CDK app, relative to the repository root. |

---

##### `iamRoleArn`<sup>Required</sup> <a name="iamRoleArn" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.iamRoleArn"></a>

```typescript
public readonly iamRoleArn: string;
```

- *Type:* string

Default OIDC role ARN for AWS credential assumption.

---

##### `pkgNamespace`<sup>Required</sup> <a name="pkgNamespace" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string

npm scope for versioned cloud assembly packages (e.g., '@defiance-digital').

---

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

Stack name prefix.

Stage names are appended with a dash (e.g., 'MyApp' -> 'MyApp-Production')

---

##### `stages`<sup>Required</sup> <a name="stages" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.stages"></a>

```typescript
public readonly stages: DeployStageOptions[];
```

- *Type:* <a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions">DeployStageOptions</a>[]

Deployment stages in declaration order.

---

##### `branchName`<sup>Optional</sup> <a name="branchName" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string
- *Default:* 'main'

Branch that triggers deployments on push.

---

##### `cdkCommand`<sup>Optional</sup> <a name="cdkCommand" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.cdkCommand"></a>

```typescript
public readonly cdkCommand: string;
```

- *Type:* string
- *Default:* 'npx cdk'

CDK CLI command prefix.

---

##### `iamRoleRegion`<sup>Optional</sup> <a name="iamRoleRegion" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.iamRoleRegion"></a>

```typescript
public readonly iamRoleRegion: string;
```

- *Type:* string
- *Default:* 'us-east-1'

Default AWS region for OIDC credential assumption.

---

##### `installCommand`<sup>Optional</sup> <a name="installCommand" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.installCommand"></a>

```typescript
public readonly installCommand: string;
```

- *Type:* string
- *Default:* 'yarn install --check-files --frozen-lockfile'

Package install command.

---

##### `manualDeployment`<sup>Optional</sup> <a name="manualDeployment" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.manualDeployment"></a>

```typescript
public readonly manualDeployment: boolean;
```

- *Type:* boolean
- *Default:* true

Generate a workflow_dispatch workflow for manual deployments and rollbacks.

---

##### `nodeVersion`<sup>Optional</sup> <a name="nodeVersion" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.nodeVersion"></a>

```typescript
public readonly nodeVersion: string;
```

- *Type:* string
- *Default:* '24.x'

Node.js version for workflow runners.

---

##### `useGithubPackagesForAssembly`<sup>Optional</sup> <a name="useGithubPackagesForAssembly" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.useGithubPackagesForAssembly"></a>

```typescript
public readonly useGithubPackagesForAssembly: boolean;
```

- *Type:* boolean
- *Default:* true

Version and publish cloud assembly to GitHub Packages for rollback support.

---

##### `workingDirectory`<sup>Optional</sup> <a name="workingDirectory" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions.property.workingDirectory"></a>

```typescript
public readonly workingDirectory: string;
```

- *Type:* string
- *Default:* repository root

Working directory for the CDK app, relative to the repository root.

Useful for monorepos where infrastructure lives in a subdirectory (e.g., 'infra').

When set, all workflow run steps will use `defaults.run.working-directory`
and artifact paths will be adjusted accordingly.

---

### DeployDispatchInternalOptions <a name="DeployDispatchInternalOptions" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions"></a>

Internal helper to build deploy dispatch workflow options from pipeline options.

Exported for use by CdkDeployDispatchWorkflow.

#### Initializer <a name="Initializer" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.Initializer"></a>

```typescript
import { DeployDispatchInternalOptions } from '@jjrawlins/cdk-deploy-pr-github-action'

const deployDispatchInternalOptions: DeployDispatchInternalOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.appName">appName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.cdkCommand">cdkCommand</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.iamRoleArn">iamRoleArn</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.iamRoleRegion">iamRoleRegion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.installCommand">installCommand</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.nodeVersion">nodeVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.stages">stages</a></code> | <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions">DeployStageOptions</a>[]</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.workingDirectory">workingDirectory</a></code> | <code>string</code> | *No description.* |

---

##### `appName`<sup>Required</sup> <a name="appName" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.appName"></a>

```typescript
public readonly appName: string;
```

- *Type:* string

---

##### `cdkCommand`<sup>Required</sup> <a name="cdkCommand" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.cdkCommand"></a>

```typescript
public readonly cdkCommand: string;
```

- *Type:* string

---

##### `iamRoleArn`<sup>Required</sup> <a name="iamRoleArn" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.iamRoleArn"></a>

```typescript
public readonly iamRoleArn: string;
```

- *Type:* string

---

##### `iamRoleRegion`<sup>Required</sup> <a name="iamRoleRegion" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.iamRoleRegion"></a>

```typescript
public readonly iamRoleRegion: string;
```

- *Type:* string

---

##### `installCommand`<sup>Required</sup> <a name="installCommand" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.installCommand"></a>

```typescript
public readonly installCommand: string;
```

- *Type:* string

---

##### `nodeVersion`<sup>Required</sup> <a name="nodeVersion" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.nodeVersion"></a>

```typescript
public readonly nodeVersion: string;
```

- *Type:* string

---

##### `pkgNamespace`<sup>Required</sup> <a name="pkgNamespace" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string

---

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

---

##### `stages`<sup>Required</sup> <a name="stages" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.stages"></a>

```typescript
public readonly stages: DeployStageOptions[];
```

- *Type:* <a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions">DeployStageOptions</a>[]

---

##### `workingDirectory`<sup>Optional</sup> <a name="workingDirectory" id="@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions.property.workingDirectory"></a>

```typescript
public readonly workingDirectory: string;
```

- *Type:* string

---

### DeployStageOptions <a name="DeployStageOptions" id="@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions"></a>

Configuration for a single deployment stage.

#### Initializer <a name="Initializer" id="@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.Initializer"></a>

```typescript
import { DeployStageOptions } from '@jjrawlins/cdk-deploy-pr-github-action'

const deployStageOptions: DeployStageOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.env">env</a></code> | <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.AwsEnvironment">AwsEnvironment</a></code> | AWS target environment (account + region). |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.name">name</a></code> | <code>string</code> | Stage name (used as suffix in job IDs and stack names, e.g., 'Sandbox', 'Production'). |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.dependsOn">dependsOn</a></code> | <code>string[]</code> | Stage names that must complete successfully before this stage runs. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.environment">environment</a></code> | <code>string</code> | GitHub Environment name for protection rules, secrets scoping, and deployment approvals. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.iamRoleArn">iamRoleArn</a></code> | <code>string</code> | Override the default OIDC role ARN for this stage. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.iamRoleRegion">iamRoleRegion</a></code> | <code>string</code> | Override the default AWS region for OIDC credential assumption. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.manualApproval">manualApproval</a></code> | <code>boolean</code> | When true, this stage is excluded from the automatic deploy.yml pipeline and can only be deployed via the deploy-dispatch.yml workflow. |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.stacks">stacks</a></code> | <code>string[]</code> | Specific CDK stack names to deploy in this stage. |

---

##### `env`<sup>Required</sup> <a name="env" id="@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.env"></a>

```typescript
public readonly env: AwsEnvironment;
```

- *Type:* <a href="#@jjrawlins/cdk-deploy-pr-github-action.AwsEnvironment">AwsEnvironment</a>

AWS target environment (account + region).

---

##### `name`<sup>Required</sup> <a name="name" id="@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Stage name (used as suffix in job IDs and stack names, e.g., 'Sandbox', 'Production').

---

##### `dependsOn`<sup>Optional</sup> <a name="dependsOn" id="@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.dependsOn"></a>

```typescript
public readonly dependsOn: string[];
```

- *Type:* string[]
- *Default:* depends only on publish-assets (runs as soon as assets are ready)

Stage names that must complete successfully before this stage runs.

Stages with no dependsOn run in parallel after the publish-assets job.

---

*Example*

```typescript
['Sandbox', 'Dev'] // waits for both before deploying
```


##### `environment`<sup>Optional</sup> <a name="environment" id="@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string
- *Default:* uses the stage name

GitHub Environment name for protection rules, secrets scoping, and deployment approvals.

---

##### `iamRoleArn`<sup>Optional</sup> <a name="iamRoleArn" id="@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.iamRoleArn"></a>

```typescript
public readonly iamRoleArn: string;
```

- *Type:* string

Override the default OIDC role ARN for this stage.

Useful for cross-account deployments where each account has its own role.

---

##### `iamRoleRegion`<sup>Optional</sup> <a name="iamRoleRegion" id="@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.iamRoleRegion"></a>

```typescript
public readonly iamRoleRegion: string;
```

- *Type:* string
- *Default:* uses the pipeline-level iamRoleRegion or the stage env.region

Override the default AWS region for OIDC credential assumption.

---

##### `manualApproval`<sup>Optional</sup> <a name="manualApproval" id="@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.manualApproval"></a>

```typescript
public readonly manualApproval: boolean;
```

- *Type:* boolean
- *Default:* false

When true, this stage is excluded from the automatic deploy.yml pipeline and can only be deployed via the deploy-dispatch.yml workflow.

Auto-deploy stages cannot depend on manual-approval stages.

---

##### `stacks`<sup>Optional</sup> <a name="stacks" id="@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions.property.stacks"></a>

```typescript
public readonly stacks: string[];
```

- *Type:* string[]
- *Default:* ['{stackPrefix}-{stageName}']

Specific CDK stack names to deploy in this stage.

---

## Classes <a name="Classes" id="Classes"></a>

### CdkDeployDispatchWorkflow <a name="CdkDeployDispatchWorkflow" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployDispatchWorkflow"></a>

Generates a workflow_dispatch workflow for manual CDK deployments and rollbacks.

Allows deploying any previously published version of the cloud assembly
to any configured environment. This enables:
- Manual promotion between environments
- Rollback to any previous version
- Ad-hoc deployments outside the normal CI/CD flow

#### Initializers <a name="Initializers" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployDispatchWorkflow.Initializer"></a>

```typescript
import { CdkDeployDispatchWorkflow } from '@jjrawlins/cdk-deploy-pr-github-action'

new CdkDeployDispatchWorkflow(project: any, options: DeployDispatchInternalOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployDispatchWorkflow.Initializer.parameter.project">project</a></code> | <code>any</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployDispatchWorkflow.Initializer.parameter.options">options</a></code> | <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions">DeployDispatchInternalOptions</a></code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployDispatchWorkflow.Initializer.parameter.project"></a>

- *Type:* any

---

##### `options`<sup>Required</sup> <a name="options" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployDispatchWorkflow.Initializer.parameter.options"></a>

- *Type:* <a href="#@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions">DeployDispatchInternalOptions</a>

---





### CdkDeployPipeline <a name="CdkDeployPipeline" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipeline"></a>

Generates GitHub Actions workflows for CDK deployments.

Creates a `deploy.yml` workflow with:
- Synth job to compile and synthesize the CDK app
- Asset publish job to upload Lambda/container assets to AWS
- Per-stage deploy jobs with GitHub Environments, parallel execution, and concurrency groups

Optionally creates a `deploy-dispatch.yml` workflow for manual deployments and rollbacks.

#### Initializers <a name="Initializers" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipeline.Initializer"></a>

```typescript
import { CdkDeployPipeline } from '@jjrawlins/cdk-deploy-pr-github-action'

new CdkDeployPipeline(project: any, options: CdkDeployPipelineOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipeline.Initializer.parameter.project">project</a></code> | <code>any</code> | *No description.* |
| <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipeline.Initializer.parameter.options">options</a></code> | <code><a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions">CdkDeployPipelineOptions</a></code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipeline.Initializer.parameter.project"></a>

- *Type:* any

---

##### `options`<sup>Required</sup> <a name="options" id="@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipeline.Initializer.parameter.options"></a>

- *Type:* <a href="#@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions">CdkDeployPipelineOptions</a>

---






