variable "default_workspace_properties" {
  type = object({
    name                = string
    envs                = list(string)
    auto_apply          = bool
    global_remote_state = bool
  })
  default = {
    name                = ""
    envs                = []
    auto_apply          = true
    global_remote_state = true
  }
}
