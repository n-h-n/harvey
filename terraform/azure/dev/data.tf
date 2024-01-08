data "azurerm_client_config" "current" {}

data "azurerm_public_ip" "appgw_public_ip" {
  name                = "applicationgateway-appgwpip"
  resource_group_name = "MC_app-eastus_app-eastus-dev_eastus"
}
