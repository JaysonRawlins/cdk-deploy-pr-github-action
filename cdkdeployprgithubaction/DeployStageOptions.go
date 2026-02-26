package cdkdeployprgithubaction


// Configuration for a single deployment stage.
type DeployStageOptions struct {
	// AWS target environment (account + region).
	Env *AwsEnvironment `field:"required" json:"env" yaml:"env"`
	// Stage name (used as suffix in job IDs and stack names, e.g., 'Sandbox', 'Production').
	Name *string `field:"required" json:"name" yaml:"name"`
	// Stage names that must complete successfully before this stage runs.
	//
	// Stages with no dependsOn run in parallel after the publish-assets job.
	//
	// Example:
	//   ['Sandbox', 'Dev'] // waits for both before deploying
	//
	// Default: - depends only on publish-assets (runs as soon as assets are ready).
	//
	DependsOn *[]*string `field:"optional" json:"dependsOn" yaml:"dependsOn"`
	// GitHub Environment name for protection rules, secrets scoping, and deployment approvals.
	// Default: - uses the stage name.
	//
	Environment *string `field:"optional" json:"environment" yaml:"environment"`
	// Override the default OIDC role ARN for this stage.
	//
	// Useful for cross-account deployments where each account has its own role.
	IamRoleArn *string `field:"optional" json:"iamRoleArn" yaml:"iamRoleArn"`
	// Override the default AWS region for OIDC credential assumption.
	// Default: - uses the pipeline-level iamRoleRegion or the stage env.region
	//
	IamRoleRegion *string `field:"optional" json:"iamRoleRegion" yaml:"iamRoleRegion"`
	// Specific CDK stack names to deploy in this stage.
	// Default: - ['{stackPrefix}-{stageName}'].
	//
	Stacks *[]*string `field:"optional" json:"stacks" yaml:"stacks"`
}

