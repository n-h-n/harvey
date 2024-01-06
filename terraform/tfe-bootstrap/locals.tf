locals {
  organization_name = "n-h-n"

  vcs_repo_id = "n-h-n/harvey"
  vcs_token   = data.tfe_oauth_client.github.oauth_token_id

  merged_workspace_defaults = [for workspace in local.workspaces : merge(var.default_workspace_properties, workspace)]
  workspace_generator = flatten([
    for workspace in local.merged_workspace_defaults : [
      for env in workspace.envs : {
        name = "${replace(trim(replace(workspace.path, "terraform/", ""), "/"), "/", "-")}-${env}"

        auto_apply                    = workspace.auto_apply
        env                           = env
        global_remote_state           = workspace.global_remote_state
        structured_run_output_enabled = false
        working_directory             = "${workspace.path}/${env}"

        tag_names = [
          "harvey",
          env,
          "repo:harvey"
        ]
      }
    ]
  ])
}
