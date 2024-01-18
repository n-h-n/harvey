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

// Eh, I just made this through the azure CLI and kept it
# resource "azurerm_role_assignment" "cci-acr" {
#   for_each = azurerm_resource_group.rg

#   principal_id                     = "b0bd73c0-8379-48ba-bd4f-29084ffafdd1" // circle ci service account principal
#   role_definition_name             = "AcrPush"
#   scope                            = azurerm_container_registry.acr[each.key].id
#   skip_service_principal_aad_check = true
# }

resource "azurerm_user_assigned_identity" "keyvault" {
  for_each = azurerm_resource_group.rg

  resource_group_name = each.key
  location            = each.value.location
  name                = "mi-appgw-keyvault-${each.key}"
}

resource "azurerm_user_assigned_identity" "backend" {
  for_each = azurerm_resource_group.rg

  name                = "mi-backend-${each.key}"
  resource_group_name = each.key
  location            = each.value.location
}

resource "azurerm_user_assigned_identity" "frontend" {
  for_each = azurerm_resource_group.rg

  name                = "mi-frontend-${each.key}"
  resource_group_name = each.key
  location            = each.value.location
}

resource "azurerm_federated_identity_credential" "backend" {
  for_each = azurerm_user_assigned_identity.backend
  
  name                = "mi-cred-backend-${each.key}"
  resource_group_name = each.key
  audience            = ["api://AzureADTokenExchange"]
  issuer              = azurerm_kubernetes_cluster.app[each.key].oidc_issuer_url
  parent_id           = each.value.id
  subject             = "system:serviceaccount:dataroom:dataroom-backend"
}

resource "azurerm_federated_identity_credential" "frontend" {
  for_each = azurerm_user_assigned_identity.frontend
  
  name                = "mi-cred-backend-${each.key}"
  resource_group_name = each.key
  audience            = ["api://AzureADTokenExchange"]
  issuer              = azurerm_kubernetes_cluster.app[each.key].oidc_issuer_url
  parent_id           = each.value.id
  subject             = "system:serviceaccount:dataroom:dataroom-frontend"
}

resource "azurerm_role_assignment" "backend" {
  for_each = azurerm_storage_account.storage

  scope = each.value.id

  // could use role_definition_id here with a custom, more granular role definition we define ourselves
  role_definition_name = "Storage Blob Data Contributor"

  principal_id = azurerm_user_assigned_identity.backend[each.key].principal_id
}
