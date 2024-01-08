resource "azurerm_key_vault" "kv" {
  for_each = azurerm_resource_group.rg

  name                       = "keyvault-${each.key}"
  location                   = each.value.location
  resource_group_name        = each.key
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    certificate_permissions = [
      "Create",
      "Delete",
      "DeleteIssuers",
      "Get",
      "GetIssuers",
      "Import",
      "List",
      "ListIssuers",
      "ManageContacts",
      "ManageIssuers",
      "Purge",
      "SetIssuers",
      "Update",
    ]

    key_permissions = [
      "Backup",
      "Create",
      "Decrypt",
      "Delete",
      "Encrypt",
      "Get",
      "Import",
      "List",
      "Purge",
      "Recover",
      "Restore",
      "Sign",
      "UnwrapKey",
      "Update",
      "Verify",
      "WrapKey",
    ]

    secret_permissions = [
      "Backup",
      "Delete",
      "Get",
      "List",
      "Purge",
      "Recover",
      "Restore",
      "Set",
    ]
  }

  access_policy {
    object_id = azurerm_user_assigned_identity.keyvault[each.key].principal_id
    tenant_id = data.azurerm_client_config.current.tenant_id

    secret_permissions = [
      "Get"
    ]
  }
}

resource "azurerm_key_vault_certificate" "appgw" {
  for_each = azurerm_key_vault.kv

  name         = "appgw-cert-${each.key}"
  key_vault_id = each.value.id

  certificate_policy {
    issuer_parameters {
      name = "Self"
    }

    key_properties {
      exportable = true
      key_size   = 2048
      key_type   = "RSA"
      reuse_key  = true
    }

    lifetime_action {
      action {
        action_type = "AutoRenew"
      }

      trigger {
        days_before_expiry = 30
      }
    }

    secret_properties {
      content_type = "application/x-pkcs12"
    }

    x509_certificate_properties {
      # Server Authentication = 1.3.6.1.5.5.7.3.1
      # Client Authentication = 1.3.6.1.5.5.7.3.2
      extended_key_usage = ["1.3.6.1.5.5.7.3.1"]

      key_usage = [
        "cRLSign",
        "dataEncipherment",
        "digitalSignature",
        "keyAgreement",
        "keyCertSign",
        "keyEncipherment",
      ]

      subject_alternative_names {
        dns_names = ["greywind.services", "*.greywind.services"]
      }

      subject            = "CN=greywind.services"
      validity_in_months = 12
    }
  }
}

output "appgw_eastus_cert_secret_id" {
  value = azurerm_key_vault_certificate.appgw["app-eastus"].secret_id
}
