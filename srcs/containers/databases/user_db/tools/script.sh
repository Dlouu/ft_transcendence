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

ROOT_AUTH_ARGS=( -u root -p${USER_DB_ROOT_PWD} )

# Attente readiness
until mariadb "${ROOT_AUTH_ARGS[@]}" -e "SELECT 1" &>/dev/null; do
	echo "still waiting"
    sleep 1
done

if [ "$FRESH_INSTALL" -eq 1 ] && [ -n "$USER_DB_ROOT_PWD" ]; then
    echo "Setting root password..."
    mariadb -u root -e "
        ALTER USER 'root'@'localhost' IDENTIFIED BY '${USER_DB_ROOT_PWD}';
        FLUSH PRIVILEGES;
    "
    # ROOT_AUTH_ARGS+=( "-p${USER_DB_ROOT_PWD}" )
fi

if [ -n "$USER_DB_USER_NAME" ] && [ -n "$USER_DB_USER_PWD" ] && [ -n "$USER_DB_NAME" ]; then
    echo "Creating database and user..."
    mariadb "${ROOT_AUTH_ARGS[@]}" -e "
        CREATE DATABASE IF NOT EXISTS \`${USER_DB_NAME}\`;
        CREATE USER IF NOT EXISTS '${USER_DB_USER_NAME}'@'%' IDENTIFIED BY '${USER_DB_USER_PWD}';
        GRANT ALL PRIVILEGES ON \`${USER_DB_NAME}\`.* TO '${USER_DB_USER_NAME}'@'%';
        FLUSH PRIVILEGES;
    "
fi

# --- Run initialization scripts ---
if [ -d "/docker-entrypoint-initdb.d" ]; then
    echo "Running init scripts from /docker-entrypoint-initdb.d..."
    for f in /docker-entrypoint-initdb.d/*; do
        case "$f" in
            *.sh)
                echo "Running $f"
                . "$f"
                ;;
            *.sql)
                echo "Running $f"
                mariadb "${ROOT_AUTH_ARGS[@]}" "$USER_DB_NAME" < "$f"
                ;;
            *.sql.gz)
                echo "Running $f"
                gunzip -c "$f" | mariadb "${ROOT_AUTH_ARGS[@]}" "$USER_DB_USER_NAME"
                ;;
            *)
                echo "Ignoring $f"
                ;;
        esac
    done
fi

mysqladmin "${ROOT_AUTH_ARGS[@]}" shutdown

echo "Starting MariaDB in foreground..."
exec mysqld \
  --user=mysql \
  --bind-address=0.0.0.0 \
  --port=3306 \
  --skip-networking=0


