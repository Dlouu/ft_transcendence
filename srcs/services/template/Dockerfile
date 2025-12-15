FROM debian:trixie

RUN apt-get update -y && apt-get upgrade -y

COPY ./tools/script.sh /

RUN chmod +x /script.sh

CMD [ "/script.sh" ]
