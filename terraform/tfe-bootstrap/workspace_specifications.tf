locals {
  workspaces = [
    # Usually I'd split up workspaces to make planning/runs faster with less
    # resources managed in a single mega-workspace, however for this demo
    # just gonna make one workspace to save on resource count (outputs, data referencing)
    # due to free tier
    # {
    #   path = "terraform/azure/networking"
    #   envs = ["dev"]
    # },
    # {
    #   path = "terraform/azure/databases"
    #   envs = ["dev"]
    # },
    # {
    #   path = "terraform/azure/identities"
    #   envs = ["dev"]
    # }
    {
      path = "terraform/azure"
      envs = ["dev"]
    }
  ]
}
