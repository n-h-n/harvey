resource "azurerm_kubernetes_cluster" "app" {
  for_each = azurerm_resource_group.rg

  name                = "${each.key}-${local.env}"
  location            = each.value.location
  resource_group_name = each.key
  dns_prefix          = "${each.key}-${local.env}"

  default_node_pool {
    name                   = "default"
    node_count             = 1
    vm_size                = "Standard_D2as_v5"
    vnet_subnet_id         = azurerm_subnet.subnet["subnet-${each.key}-public"].id
    enable_host_encryption = true
  }

  identity {
    type = "SystemAssigned"
  }
  
  network_profile {
    network_plugin = "azure"
    service_cidr = "172.16.0.0/12"
    dns_service_ip = "172.16.2.0"
  }

  tags = {
    env = local.env
  }

  // Use Workload Identity federation to give granular access to pods
  // via service account. Like AWS EKS<->OIDC IAM Role injection into the pods, but for Azure
  oidc_issuer_enabled       = true
  workload_identity_enabled = true
}
