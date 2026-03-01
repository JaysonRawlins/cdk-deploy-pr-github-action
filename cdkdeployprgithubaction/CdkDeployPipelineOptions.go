package cdkdeployprgithubaction


// Configuration for the CDK deploy pipeline.
type CdkDeployPipelineOptions struct {
	// Default OIDC role ARN for AWS credential assumption.
	IamRoleArn *string `field:"required" json:"iamRoleArn" yaml:"iamRoleArn"`
	// npm scope for versioned cloud assembly packages (e.g., '@defiance-digital').
	PkgNamespace *string `field:"required" json:"pkgNamespace" yaml:"pkgNamespace"`
	// Stack name prefix.
	//
	// Stage names are appended with a dash (e.g., 'MyApp' -> 'MyApp-Production')
	StackPrefix *string `field:"required" json:"stackPrefix" yaml:"stackPrefix"`
	// Deployment stages in declaration order.
	Stages *[]*DeployStageOptions `field:"required" json:"stages" yaml:"stages"`
	// Branch that triggers deployments on push.
	// Default: 'main'.
	//
	BranchName *string `field:"optional" json:"branchName" yaml:"branchName"`
	// CDK CLI command prefix.
	// Default: 'npx cdk'.
	//
	CdkCommand *string `field:"optional" json:"cdkCommand" yaml:"cdkCommand"`
	// Default AWS region for OIDC credential assumption.
	// Default: 'us-east-1'.
	//
	IamRoleRegion *string `field:"optional" json:"iamRoleRegion" yaml:"iamRoleRegion"`
	// Package install command.
	// Default: 'yarn install --check-files --frozen-lockfile'.
	//
	InstallCommand *string `field:"optional" json:"installCommand" yaml:"installCommand"`
	// Generate a workflow_dispatch workflow for manual deployments and rollbacks.
	// Default: true.
	//
	ManualDeployment *bool `field:"optional" json:"manualDeployment" yaml:"manualDeployment"`
	// Node.js version for workflow runners.
	// Default: '24.x'
	//
	NodeVersion *string `field:"optional" json:"nodeVersion" yaml:"nodeVersion"`
	// Version and publish cloud assembly to GitHub Packages for rollback support.
	// Default: true.
	//
	UseGithubPackagesForAssembly *bool `field:"optional" json:"useGithubPackagesForAssembly" yaml:"useGithubPackagesForAssembly"`
	// Working directory for the CDK app, relative to the repository root.
	//
	// Useful for monorepos where infrastructure lives in a subdirectory (e.g., 'infra').
	//
	// When set, all workflow run steps will use `defaults.run.working-directory`
	// and artifact paths will be adjusted accordingly.
	// Default: - repository root.
	//
	WorkingDirectory *string `field:"optional" json:"workingDirectory" yaml:"workingDirectory"`
}

