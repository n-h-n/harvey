resource "tfe_workspace_variable_set" "harvey" {
  for_each = { for k, v in local.workspace_generator : v.name => v }

  variable_set_id = data.tfe_variable_set.harvey[each.value.env].id
  workspace_id    = tfe_workspace.workspaces[each.key].id
}
