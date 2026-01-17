FROM python:3.13-alpine

RUN apk add --no-cache bash mariadb-connector-c-dev gcc musl-dev python3-dev

COPY app/ .

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "-m", "main"]
