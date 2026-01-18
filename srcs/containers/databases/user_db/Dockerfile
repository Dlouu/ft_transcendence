FROM alpine:3.19

RUN apk add --no-cache mariadb mariadb-client mariadb-server-utils bash

COPY 50-server.cnf /etc/mysql/mariadb.conf.d/50-server.cnf
COPY ./tools/script.sh /
COPY ./tools/sql/* /docker-entrypoint-initdb.d/

RUN chmod +x /script.sh

CMD [ "/script.sh" ]
