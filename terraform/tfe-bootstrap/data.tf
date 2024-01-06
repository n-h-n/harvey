data "tfe_organization" "n-h-n" {
  name = local.organization_name
}

data "tfe_oauth_client" "github" {
  name         = "github.com-n-h-n-custom"
  organization = data.tfe_organization.n-h-n.name
}

data "tfe_variable_set" "harvey" {
  for_each = toset(["dev", "prod"])

  name         = "harvey-${each.key}-secrets"
  organization = data.tfe_organization.n-h-n.name
}
