// A projen construct that generates GitHub Actions workflows for CDK deployments with GitHub Environments, parallel stages, versioned assemblies, and manual rollback.
package cdkdeployprgithubaction

import (
	"reflect"

	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
)

func init() {
	_jsii_.RegisterStruct(
		"@jjrawlins/cdk-deploy-pr-github-action.AwsEnvironment",
		reflect.TypeOf((*AwsEnvironment)(nil)).Elem(),
	)
	_jsii_.RegisterClass(
		"@jjrawlins/cdk-deploy-pr-github-action.CdkDeployDispatchWorkflow",
		reflect.TypeOf((*CdkDeployDispatchWorkflow)(nil)).Elem(),
		nil, // no members
		func() interface{} {
			return &jsiiProxy_CdkDeployDispatchWorkflow{}
		},
	)
	_jsii_.RegisterClass(
		"@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipeline",
		reflect.TypeOf((*CdkDeployPipeline)(nil)).Elem(),
		nil, // no members
		func() interface{} {
			return &jsiiProxy_CdkDeployPipeline{}
		},
	)
	_jsii_.RegisterStruct(
		"@jjrawlins/cdk-deploy-pr-github-action.CdkDeployPipelineOptions",
		reflect.TypeOf((*CdkDeployPipelineOptions)(nil)).Elem(),
	)
	_jsii_.RegisterStruct(
		"@jjrawlins/cdk-deploy-pr-github-action.DeployDispatchInternalOptions",
		reflect.TypeOf((*DeployDispatchInternalOptions)(nil)).Elem(),
	)
	_jsii_.RegisterStruct(
		"@jjrawlins/cdk-deploy-pr-github-action.DeployStageOptions",
		reflect.TypeOf((*DeployStageOptions)(nil)).Elem(),
	)
}
