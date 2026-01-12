FROM alpine:3.19

RUN apk add --no-cache bash

COPY ./tools/script.sh /

RUN chmod +x /script.sh

CMD [ "/script.sh" ]
