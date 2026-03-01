package cdkdeployprgithubaction


// Internal helper to build deploy dispatch workflow options from pipeline options.
//
// Exported for use by CdkDeployDispatchWorkflow.
type DeployDispatchInternalOptions struct {
	AppName *string `field:"required" json:"appName" yaml:"appName"`
	CdkCommand *string `field:"required" json:"cdkCommand" yaml:"cdkCommand"`
	IamRoleArn *string `field:"required" json:"iamRoleArn" yaml:"iamRoleArn"`
	IamRoleRegion *string `field:"required" json:"iamRoleRegion" yaml:"iamRoleRegion"`
	InstallCommand *string `field:"required" json:"installCommand" yaml:"installCommand"`
	NodeVersion *string `field:"required" json:"nodeVersion" yaml:"nodeVersion"`
	PkgNamespace *string `field:"required" json:"pkgNamespace" yaml:"pkgNamespace"`
	StackPrefix *string `field:"required" json:"stackPrefix" yaml:"stackPrefix"`
	Stages *[]*DeployStageOptions `field:"required" json:"stages" yaml:"stages"`
	WorkingDirectory *string `field:"optional" json:"workingDirectory" yaml:"workingDirectory"`
}

