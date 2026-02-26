package cdkdeployprgithubaction

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/JaysonRawlins/cdk-deploy-pr-github-action/cdkdeployprgithubaction/jsii"
)

// Generates a workflow_dispatch workflow for manual CDK deployments and rollbacks.
//
// Allows deploying any previously published version of the cloud assembly
// to any configured environment. This enables:
// - Manual promotion between environments
// - Rollback to any previous version
// - Ad-hoc deployments outside the normal CI/CD flow.
type CdkDeployDispatchWorkflow interface {
}

// The jsii proxy struct for CdkDeployDispatchWorkflow
type jsiiProxy_CdkDeployDispatchWorkflow struct {
	_ byte // padding
}

func NewCdkDeployDispatchWorkflow(project interface{}, options *DeployDispatchInternalOptions) CdkDeployDispatchWorkflow {
	_init_.Initialize()

	if err := validateNewCdkDeployDispatchWorkflowParameters(project, options); err != nil {
		panic(err)
	}
	j := jsiiProxy_CdkDeployDispatchWorkflow{}

	_jsii_.Create(
		"@jjrawlins/cdk-deploy-pr-github-action.CdkDeployDispatchWorkflow",
		[]interface{}{project, options},
		&j,
	)

	return &j
}

func NewCdkDeployDispatchWorkflow_Override(c CdkDeployDispatchWorkflow, project interface{}, options *DeployDispatchInternalOptions) {
	_init_.Initialize()

	_jsii_.Create(
		"@jjrawlins/cdk-deploy-pr-github-action.CdkDeployDispatchWorkflow",
		[]interface{}{project, options},
		c,
	)
}

