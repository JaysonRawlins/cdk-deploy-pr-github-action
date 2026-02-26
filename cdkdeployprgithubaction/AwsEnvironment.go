package cdkdeployprgithubaction


// AWS environment target for a deployment stage.
type AwsEnvironment struct {
	// AWS account ID.
	Account *string `field:"required" json:"account" yaml:"account"`
	// AWS region.
	Region *string `field:"required" json:"region" yaml:"region"`
}

