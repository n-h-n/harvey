terraform {
  cloud {
    organization = "n-h-n"
    workspaces {
      name = "harvey-azure-dev"
    }
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.86"
    }
  }
}

provider "azurerm" {
  features {}
}
