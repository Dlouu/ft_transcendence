#!/bin/bash
set -e

echo "Running custom auth initialization..."

ROOT_AUTH_ARGS=(-u root -p"${MYSQL_ROOT_PASSWORD}")

if [ -n "$MYSQL_USER" ] && [ -n "$MYSQL_PASSWORD" ]; then
  mariadb "${ROOT_AUTH_ARGS[@]}" -e "
    CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
    GRANT ALL PRIVILEGES ON user_auth.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
  "
fi

echo "Auth DB initialized."
