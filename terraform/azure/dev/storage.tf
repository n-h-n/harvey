resource "azurerm_storage_account" "storage" {
  for_each = azurerm_resource_group.rg

  name                     = replace("storageaccount${each.key}","-","")
  resource_group_name      = each.key
  location                 = each.value.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
}
