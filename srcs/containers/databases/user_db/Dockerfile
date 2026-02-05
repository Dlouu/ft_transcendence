FROM mariadb:11.8

COPY 50-server.cnf /etc/mysql/mariadb.conf.d/50-server.cnf
COPY ./tools/sql/* /docker-entrypoint-initdb.d/
COPY ./tools/script.sh /docker-entrypoint-initdb.d/01-init-auth.sh

RUN chmod +x /docker-entrypoint-initdb.d/01-init-auth.sh
