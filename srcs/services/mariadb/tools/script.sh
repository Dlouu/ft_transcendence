#!/bin/bash
set -e

mkdir -p /run/mysqld
chown -R mysql:mysql /run/mysqld
chown -R mysql:mysql /var/lib/mysql

FRESH_INSTALL=0
if [ ! -d "/var/lib/mysql/mysql" ]; then
    FRESH_INSTALL=1
    echo "Fresh MariaDB install, initializing datadir..."
    mysql_install_db --user=mysql --ldata=/var/lib/mysql
fi

# On démarre MariaDB en background pour faire la config
mysqld_safe --user=mysql &
pid="$!"

ROOT_AUTH_ARGS=( -u root )

if [ "$FRESH_INSTALL" -eq 0 ] && [ -n "$DB_ROOT_PWD" ]; then
    ROOT_AUTH_ARGS+=( "-p${DB_ROOT_PWD}" )
fi

echo "Waiting for MariaDB to be ready..."
until mariadb "${ROOT_AUTH_ARGS[@]}" -e "SELECT 1" &>/dev/null; do
    sleep 1
done
echo "MariaDB is up."

if [ "$FRESH_INSTALL" -eq 1 ] && [ -n "$DB_ROOT_PWD" ]; then
    echo "Setting root password..."
    mariadb -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_ROOT_PWD}'; FLUSH PRIVILEGES;"
    ROOT_AUTH_ARGS=( -u root "-p${DB_ROOT_PWD}" )
fi

if [ -n "$DB_USER_NAME" ] && [ -n "$DB_USER_PWD" ] && [ -n "$DB_NAME" ]; then
    echo "Creating database ${DB_NAME} and user ${DB_USER_NAME}..."
    mariadb "${ROOT_AUTH_ARGS[@]}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;"
    mariadb "${ROOT_AUTH_ARGS[@]}" -e "CREATE USER IF NOT EXISTS '${DB_USER_NAME}'@'%' IDENTIFIED BY '${DB_USER_PWD}';"
    mariadb "${ROOT_AUTH_ARGS[@]}" -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER_NAME}'@'%'; FLUSH PRIVILEGES;"
fi

mysqladmin "${ROOT_AUTH_ARGS[@]}" shutdown

echo "Starting MariaDB in foreground..."
exec mysqld_safe --user=mysql
