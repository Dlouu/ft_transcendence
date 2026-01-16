#!/bin/sh
set -e

CONFIG_FILE="/vault/config/vault.hcl"
LOG_DIR="/vault/logs"
SCRIPT_LOG="/vault/logs/init.log"
TLS_DIR="/vault/tls"
TLS_CERT="/vault/tls/vault.crt"
TLS_KEY="/vault/tls/vault.key"
ENV_FILE="/vault/env/vault.env"
INIT_FILE="/vault/env/init.json"
KEYS_FILE="/vault/env/keys.env"

mkdir -p "$LOG_DIR" "$TLS_DIR" /vault/env /vault/data
: > "$SCRIPT_LOG"

log() {
  printf "%s %s\n" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" | tee -a "$SCRIPT_LOG"
}

if [ ! -f "$TLS_CERT" ] || [ ! -f "$TLS_KEY" ]; then
  log "Generating self-signed TLS cert."
  openssl req -x509 -newkey rsa:4096 -nodes \
    -keyout "$TLS_KEY" -out "$TLS_CERT" -days 3650 \
    -subj "/CN=vault" \
    -addext "subjectAltName=DNS:vault,IP:127.0.0.1"
  chmod 600 "$TLS_KEY"
fi

cat <<'HCL' > "$CONFIG_FILE"
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
HCL

export VAULT_ADDR="https://127.0.0.1:8200"
export VAULT_CACERT="$TLS_CERT"

# Export values for other services to consume if they mount /vault/env
cat <<EOF > "$ENV_FILE"
export VAULT_ADDR=https://vault:8200
export VAULT_CACERT=$TLS_CERT
EOF
chmod 600 "$ENV_FILE"

log "Starting Vault server."
vault server -config="$CONFIG_FILE" >> "$SCRIPT_LOG" 2>&1 &
VAULT_PID=$!

attempt=0
until vault status >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 60 ]; then
    log "ERROR: Vault did not become ready."
    exit 1
  fi
  sleep 1
done

if vault status 2>/dev/null | grep -q "Initialized.*false"; then
  log "Initializing Vault."
  vault operator init -key-shares=1 -key-threshold=1 -format=json > "$INIT_FILE"

  ROOT_TOKEN=$(sed -n 's/.*"root_token":"\([^"]*\)".*/\1/p' "$INIT_FILE")
  UNSEAL_KEY=$(sed -n 's/.*"unseal_keys_b64":\["\([^"]*\)".*/\1/p' "$INIT_FILE")

  if [ -z "$ROOT_TOKEN" ] || [ -z "$UNSEAL_KEY" ]; then
    log "ERROR: Failed to parse init output."
    exit 1
  fi

  printf "export VAULT_TOKEN=%s\n" "$ROOT_TOKEN" > "$KEYS_FILE"
  printf "export VAULT_UNSEAL_KEY=%s\n" "$UNSEAL_KEY" >> "$KEYS_FILE"
  chmod 600 "$KEYS_FILE"

  log "Unsealing Vault."
  vault operator unseal "$UNSEAL_KEY" >/dev/null
  log "Vault initialized and unsealed."
else
  if vault status 2>/dev/null | grep -q "Sealed.*true"; then
    if [ -f "$KEYS_FILE" ]; then
      UNSEAL_KEY=$(sed -n 's/.*VAULT_UNSEAL_KEY=\(.*\)$/\1/p' "$KEYS_FILE")
      if [ -n "$UNSEAL_KEY" ]; then
        log "Unsealing Vault using stored key."
        vault operator unseal "$UNSEAL_KEY" >/dev/null
      else
        log "ERROR: Missing unseal key."
        exit 1
      fi
    else
      log "ERROR: Vault is sealed and no stored key found."
      exit 1
    fi
  fi
  log "Vault already initialized."
fi

log "Vault ready. Logs at /vault/logs/vault.log."
wait "$VAULT_PID"
