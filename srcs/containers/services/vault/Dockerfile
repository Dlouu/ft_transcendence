FROM hashicorp/vault:1.15.5

RUN apk add --no-cache openssl

RUN mkdir -p /vault/config /vault/data /vault/logs /vault/tls /vault/env

COPY ./vault.hcl /vault/config/vault.hcl
COPY ./tools/script.sh /usr/local/bin/vault-init.sh
RUN chmod +x /usr/local/bin/vault-init.sh

EXPOSE 8200 8201

CMD ["/usr/local/bin/vault-init.sh"]
