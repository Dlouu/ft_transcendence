# Generated at container start by /usr/local/bin/vault-init.sh
# Kept as a template for self-managed configuration.

storage "file" {
  path = "/vault/data"
}

listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_cert_file = "/vault/tls/vault.crt"
  tls_key_file  = "/vault/tls/vault.key"
}

disable_mlock = true
ui            = true

api_addr     = "https://vault:8200"
cluster_addr = "https://vault:8201"

log_file  = "/vault/logs/vault.log"
log_level = "info"
