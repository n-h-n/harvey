resource "azurerm_dns_a_record" "argocd" {
  name                = "argocd"
  zone_name           = azurerm_dns_zone.dns["app-eastus"].name
  resource_group_name = azurerm_resource_group.rg["app-eastus"].name
  ttl                 = 180
  target_resource_id  = data.azurerm_public_ip.appgw_public_ip.id
}

resource "azurerm_dns_a_record" "dataroom-frontend" {
  name                = "dataroom-frontend"
  zone_name           = azurerm_dns_zone.dns["app-eastus"].name
  resource_group_name = azurerm_resource_group.rg["app-eastus"].name
  ttl                 = 180
  target_resource_id  = data.azurerm_public_ip.appgw_public_ip.id
}
