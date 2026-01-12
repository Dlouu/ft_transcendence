FROM alpine:3.19

RUN apk add --no-cache mariadb mariadb-client bash

COPY 50-server.cnf /etc/mysql/mariadb.conf.d/50-server.cnf
COPY ./tools/script.sh /

RUN chmod +x /script.sh

CMD [ "/script.sh" ]
