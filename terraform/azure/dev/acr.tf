resource "azurerm_container_registry" "acr" {
  for_each = azurerm_resource_group.rg

  name                = "acr${each.value.location}" // alphanumeric only
  resource_group_name = each.key
  location            = each.value.location
  sku                 = "Basic"
}
