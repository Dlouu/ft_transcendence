FROM python:3.13-slim

WORKDIR /app

# THIS IS ONLY USEFULL FOR DEBUGGING PURPOSE
RUN apt-get update \
    && apt-get install -y --no-install-recommends bash \
    && apt-get install -y procps \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# THIS ONLINE HAVE TO BE EXECUTED IN PRODUCTION
# COPY app/ .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

# THIS LINE HAVE TO BE EXECUTED IN PRODUCTION
# CMD ["python" "-m" "main"]
