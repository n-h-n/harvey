resource "tfe_project" "harvey" {
  organization = data.tfe_organization.n-h-n.name
  name         = "harvey"
}
