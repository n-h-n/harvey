resource "azurerm_container_registry" "acr" {
  for_each = azurerm_resource_group.rg

  name                = "greywindacr${each.value.location}" // alphanumeric only, globally unique
  resource_group_name = each.key
  location            = each.value.location
  sku                 = "Basic"
}
