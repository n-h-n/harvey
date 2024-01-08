resource "azurerm_resource_group" "rg" {
  for_each = { for k, v in local.resource_groups : k => v }
  name     = each.key
  location = each.value.location
  tags = {
    "managed-by" = "terraform-cloud"
  }

  lifecycle {
    prevent_destroy = true
  }
}
