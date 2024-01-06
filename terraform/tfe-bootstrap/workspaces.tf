resource "tfe_workspace" "workspaces" {
  for_each = { for v in local.workspace_generator : v.name => v }

  name              = "harvey-${each.key}"
  working_directory = each.value.working_directory
  organization      = data.tfe_organization.n-h-n.name

  auto_apply          = each.value.auto_apply
  global_remote_state = each.value.global_remote_state
  project_id          = tfe_project.harvey.id

  vcs_repo {
    identifier     = local.vcs_repo_id
    oauth_token_id = local.vcs_token
  }
}
