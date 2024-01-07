resource "azurerm_role_assignment" "aks-appgw-vnet-contributor" {
  for_each             = azurerm_virtual_network.vnet
  scope                = each.value.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_kubernetes_cluster.app[each.key].ingress_application_gateway[0].ingress_application_gateway_identity[0].object_id
}
