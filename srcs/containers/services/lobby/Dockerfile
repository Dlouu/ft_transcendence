FROM python:3.13-alpine

WORKDIR /app

RUN apk add --no-cache bash mariadb-connector-c-dev gcc musl-dev python3-dev mariadb-client

COPY requirements.txt .

# THIS ONLINE HAVE TO BE EXECUTED IN PRODUCTION
# COPY app/ .

RUN pip install --no-cache-dir -r requirements.txt

# THIS LINE HAVE TO BE EXECUTED IN PRODUCTION
# CMD ["python" "-m" "main"]
