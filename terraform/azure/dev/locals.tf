locals {
  env = "dev"
  resource_groups = {
    "app-eastus" = {
      location  = "eastus"
      vnet_cidr = "10.0.0.0/8"
      vpn_cidr  = "10.255.0.0/16"
      subnet_cidrs = {
        "public"  = "10.0.0.0/16"
        "private" = "10.1.0.0/16"
        "db"      = "10.2.0.0/16"
        "alb"     = "10.3.0.0/16"
      }
    },
  }

  subnets = flatten([
    for rg, rgv in local.resource_groups : [
      for k, v in rgv.subnet_cidrs : {
        name                 = "subnet-${rg}-${k}"
        location             = rgv.location
        cidr                 = v
        resource_group_name  = rg
        virtual_network_name = "vnet-${rg}"
      }
    ]
  ])

  appgw_public_ip = "52.234.168.222"
}
