locals {
  workspaces = [
    {
      path = "terraform/azure/networking"
      envs = ["dev"]
    },
    {
      path = "terraform/azure/databases"
      envs = ["dev"]
    },
    {
      path = "terraform/azure/identities"
      envs = ["dev"]
    }
  ]
}
