// For finer-grained network controls, would have more security groups and more
// granular security rules. For example, a security group for the database
// subnet, a security group for the public subnet, and a security group for the
// private subnet. Then, security rules for each security group.
// However, there's a 500 resources free tier cap on Terraform, so one SG it is.
resource "azurerm_network_security_group" "rg_sg" {
  for_each = azurerm_resource_group.rg

  name                = "sg-${each.key}"
  location            = each.value.location
  resource_group_name = each.key

  security_rule {
    name                       = "ssh"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  // Can also allow 80 and use a 307/308 permanent redirect on the load balancer  
  security_rule {
    name                       = "web"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  // Trust our outbound egress as needed by services; node-level security can later be implemented
  // with eBPF services like Oligo, maybe in conjunction with Datadog ASM, to catch the sleeper 0-days (like log4j)
  // And yes, also implement SAST + SCA in the CI pipeline. I like Snyk.
  security_rule {
    name                       = "outbound"
    priority                   = 100
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  // Private networks all access
  dynamic "security_rule" {
    for_each = {
      "class-a" = {
        cidr     = "10.0.0.0/8"
        priority = 101
      }
      "class-b" = {
        cidr     = "172.16.0.0/12"
        priority = 102
      }
      "class-c" = {
        cidr     = "192.168.0.0/16"
        priority = 103
      }
    }

    content {
      name                       = "private-${security_rule.key}"
      priority                   = security_rule.value.priority
      direction                  = "Inbound"
      access                     = "Allow"
      protocol                   = "*"
      source_port_range          = "*"
      destination_port_range     = "*"
      source_address_prefix      = security_rule.value.cidr
      destination_address_prefix = "*"
    }
  }

}

// The virtual network
resource "azurerm_virtual_network" "vnet" {
  for_each = azurerm_resource_group.rg

  name                = "vnet-${each.key}"
  location            = each.value.location
  resource_group_name = each.value.name
  address_space = [
    local.resource_groups[each.key].vnet_cidr,
  ]

  tags = {
    managed-by = "terraform-cloud"
  }
}

// I'm just going to deploy everything on the public subnet, but create different subnet for different
// purposes
resource "azurerm_subnet" "subnet" {
  for_each = { for v in local.subnets : v.name => v }

  name                 = each.key
  resource_group_name  = each.value.resource_group_name
  virtual_network_name = each.value.virtual_network_name
  address_prefixes     = [each.value.cidr]

  depends_on = [
    azurerm_virtual_network.vnet
  ]
}

// If I had made the finer-grained SGs mentioned above, then I'd associate them appropriately.
// But for now just to save time and resources associate the one SG with all subnets
resource "azurerm_subnet_network_security_group_association" "subnet_sg" {
  for_each = azurerm_subnet.subnet

  subnet_id                 = each.value.id
  network_security_group_id = azurerm_network_security_group.rg_sg[each.value.resource_group_name].id
}

// Special VPN subnet so I can access my kubernetes cluster to do some config
resource "azurerm_subnet" "vpn" {
  for_each = azurerm_virtual_network.vnet

  name                 = "GatewaySubnet"
  resource_group_name  = each.key
  virtual_network_name = each.value.name
  address_prefixes     = [local.resource_groups[each.key].vpn_cidr]
}

# Public IP for VPN gateway
resource "azurerm_public_ip" "vpn" {
  for_each = azurerm_virtual_network.vnet

  name                = "vpn-${each.key}"
  location            = each.value.location
  resource_group_name = each.key

  allocation_method = "Static"
  sku               = "Standard"

  tags = {
    managed-by = "terraform-cloud"
  }
}

# developer virtual network gateways for Azure-AWS peering from AWS VPN
resource "azurerm_virtual_network_gateway" "compute_developer_vms" {
  for_each = azurerm_subnet.vpn

  name                = "vpn-${each.key}"
  location            = local.resource_groups[each.key].location
  resource_group_name = each.value.resource_group_name

  type                       = "Vpn"
  vpn_type                   = "RouteBased"
  generation                 = "Generation1"
  sku                        = "VpnGw1"
  active_active              = false
  enable_bgp                 = false
  private_ip_address_enabled = true

  ip_configuration {
    name                          = "vnetGatewayConfig"
    public_ip_address_id          = azurerm_public_ip.vpn[each.value.resource_group_name].id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = each.value.id
  }

}

# private Azure VM Domains and records in case we'll need it
resource "azurerm_private_dns_zone" "vnet" {
  for_each = azurerm_resource_group.rg

  name                = "${each.key}.greywind.services" // cheap potential domain name on GoDaddy for public DNS later
  resource_group_name = each.key
}

resource "azurerm_private_dns_zone_virtual_network_link" "vnet" {
  for_each = azurerm_private_dns_zone.vnet

  name                  = "link-to_${azurerm_virtual_network.vnet[each.key].name}"
  resource_group_name   = each.value.resource_group_name
  private_dns_zone_name = each.value.name
  virtual_network_id    = azurerm_virtual_network.vnet[each.key].id
}
