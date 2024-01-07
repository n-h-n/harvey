terraform {
  backend "remote" {
    organization = "n-h-n"
    workspaces {
      name = "harvey-tfe-bootstrap"
    }
  }
  required_providers {
    tfe = {
      version = "~> 0.51.1"
    }
  }
}

provider "tfe" {}
