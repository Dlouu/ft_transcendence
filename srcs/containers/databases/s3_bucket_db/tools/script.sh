#!/bin/bash
set -e

# Permissions
mkdir -p /run/mysqld
chown -R mysql:mysql /run/mysqld /var/lib/mysql

FRESH_INSTALL=0
if [ ! -d "/var/lib/mysql/mysql" ]; then
    FRESH_INSTALL=1
    echo "Fresh MariaDB install, initializing datadir..."
    mariadb-install-db --user=mysql --datadir=/var/lib/mysql
fi

echo "Starting MariaDB for initialization..."
mysqld --user=mysql --skip-networking &
pid="$!"

# Attente readiness
until mariadb -u root -e "SELECT 1" &>/dev/null; do
    sleep 1
done

ROOT_AUTH_ARGS=( -u root )

if [ "$FRESH_INSTALL" -eq 1 ] && [ -n "$DB_ROOT_PWD" ]; then
    echo "Setting root password..."
    mariadb -u root -e "
        ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_ROOT_PWD}';
        FLUSH PRIVILEGES;
    "
    ROOT_AUTH_ARGS+=( "-p${DB_ROOT_PWD}" )
fi

if [ -n "$USER_DB_NAME" ] && [ -n "$DB_USER_PWD" ] && [ -n "$DB_NAME" ]; then
    echo "Creating database and user..."
    mariadb "${ROOT_AUTH_ARGS[@]}" -e "
        CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;
        CREATE USER IF NOT EXISTS '${USER_DB_NAME}'@'%' IDENTIFIED BY '${DB_USER_PWD}';
        GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${USER_DB_NAME}'@'%';
        FLUSH PRIVILEGES;
    "
fi

mysqladmin "${ROOT_AUTH_ARGS[@]}" shutdown

echo "Starting MariaDB in foreground..."
exec mysqld --user=mysql
