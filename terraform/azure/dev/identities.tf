resource "azurerm_role_assignment" "aks-appgw-vnet-contributor" {
  for_each             = azurerm_virtual_network.vnet
  scope                = each.value.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_kubernetes_cluster.app[each.key].ingress_application_gateway[0].ingress_application_gateway_identity[0].object_id
}

resource "azurerm_role_assignment" "aks-acr" {
  for_each = azurerm_resource_group.rg

  principal_id                     = azurerm_kubernetes_cluster.app[each.key].kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.acr[each.key].id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "cci-acr" {
  for_each = azurerm_resource_group.rg

  principal_id                     = "b0bd73c0-8379-48ba-bd4f-29084ffafdd1" // circle ci service account principal
  role_definition_name             = "AcrPush"
  scope                            = azurerm_container_registry.acr[each.key].id
  skip_service_principal_aad_check = true
}

resource "azurerm_user_assigned_identity" "keyvault" {
  for_each = azurerm_resource_group.rg

  resource_group_name = each.key
  location            = each.value.location
  name                = "mi-appgw-keyvault-${each.key}"
}
