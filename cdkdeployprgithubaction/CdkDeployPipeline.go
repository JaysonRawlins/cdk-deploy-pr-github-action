package cdkdeployprgithubaction

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/JaysonRawlins/cdk-deploy-pr-github-action/cdkdeployprgithubaction/jsii"
)

// Generates GitHub Actions workflows for CDK deployments.
//
// Creates a `deploy.yml` workflow with:
// - Synth job to compile and synthesize the CDK app
// - Asset publish job to upload Lambda/container assets to AWS
// - Per-stage deploy jobs with GitHub Environments, parallel execution, and concurrency groups
//
// Optionally creates a `deploy-dispatch.yml` workflow for manual deployments and rollbacks.
type CdkDeployPipeline interface {
}

// The jsii proxy struct for CdkDeployPipeline
type jsiiProxy_CdkDeployPipeline struct {
	_ byte // padding
}

func NewCdkDeployPipeline(project interface{}, options *CdkDeployPipelineOptions) CdkDeployPipeline {
	_init_.Initialize()

	if err := validateNewCdkDeployPipelineParameters(project, options); err != nil {
		panic(err)
	}
	j := jsiiProxy_CdkDeployPipeline{}

	_jsii_.Create(
		"@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipeline",
		[]interface{}{project, options},
		&j,
	)

	return &j
}

func NewCdkDeployPipeline_Override(c CdkDeployPipeline, project interface{}, options *CdkDeployPipelineOptions) {
	_init_.Initialize()

	_jsii_.Create(
		"@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipeline",
		[]interface{}{project, options},
		c,
	)
}

