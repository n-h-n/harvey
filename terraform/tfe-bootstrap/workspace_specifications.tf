locals {
  workspaces = [
    {
      path = "terraform/azure/networking"
      envs = ["dev", "prod"]
    },
  ]
}
