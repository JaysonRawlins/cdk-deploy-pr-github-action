//go:build no_runtime_type_checking

package cdkdeployprgithubaction

// Building without runtime type checking enabled, so all the below just return nil

func validateNewCdkDeployDispatchWorkflowParameters(project interface{}, options *DeployDispatchInternalOptions) error {
	return nil
}

