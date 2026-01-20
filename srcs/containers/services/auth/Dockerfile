FROM python:3.13-alpine

WORKDIR /app

# THIS IS ONLY USEFULL FOR DEBUGGING PURPOSE
RUN apk add --no-cache \
    bash \
    curl \
    unzip \
    procps

COPY requirements.txt .

# THIS ONLINE HAVE TO BE EXECUTED IN PRODUCTION
# COPY app/ .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

# THIS LINE HAVE TO BE EXECUTED IN PRODUCTION
# CMD ["python" "-m" "main"]
