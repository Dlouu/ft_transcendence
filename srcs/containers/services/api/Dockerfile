FROM python:3.13-alpine

WORKDIR /app

RUN apk add --no-cache bash mariadb-connector-c-dev gcc musl-dev python3-dev mariadb-client

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app/ app/

COPY tools/script.sh /
RUN chmod +x /script.sh

CMD ["/script.sh"]
