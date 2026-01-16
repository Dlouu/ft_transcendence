FROM python:3.13-alpine

WORKDIR /app

# THIS IS ONLY USEFULL FOR DEBUGGING PURPOSE
RUN apk add --no-cache \
    bash \
    curl \
    unzip \
    procps

ENV VAULT_VERSION=1.15.5

RUN curl -fsSL https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip \
    -o vault.zip \
    && unzip vault.zip \
    && mv vault /usr/local/bin/ \
    && rm vault.zip

RUN vault --version

COPY requirements.txt .

# THIS ONLINE HAVE TO BE EXECUTED IN PRODUCTION
# COPY app/ .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

# THIS LINE HAVE TO BE EXECUTED IN PRODUCTION
# CMD ["python" "-m" "main"]
