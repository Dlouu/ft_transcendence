# Liste des technologies utilisees

## Vue d'ensemble
Le projet est une architecture microservices Docker Compose avec:
- frontend React/Vite
- backends Python Flask + backend game NestJS
- MariaDB (2 instances)
- Redis
- Nginx
- ELK (Elasticsearch, Logstash, Kibana)

## Infrastructure et orchestration
- Docker
- Docker Compose
- Makefile (build/run/stop/logs/fclean)
- Nginx 1.29 (reverse proxy TLS)
- OpenSSL (certificat self-signed)

## Frontend (`website`)
### Runtime / framework
- Node.js 20
- React 19
- React Router DOM 7
- Vite 7

### UI / rendu
- TailwindCSS 4
- PixiJS 8

### Reseau
- Socket.IO Client 4.8.3
- Fetch API (wrapper `useApi`)

### Qualite / tooling
- ESLint 9 + plugins React/Hooks/Unused imports
- TypeScript (utilise notamment cote game rendering)

## Backend API (`api`)
### Core
- Python 3.13
- Flask 3.1
- Flask-RESTX

### Data / validation
- Flask-SQLAlchemy
- marshmallow-sqlalchemy
- flask-marshmallow
- mysqlclient

### Securite / sessions
- PyJWT
- cryptography
- Redis client
- Flask-Limiter

### Media
- boto3 (AWS S3)
- Pillow

### HTTP/logging
- requests
- gunicorn
- python-json-logger
- ecs-logging
- watchdog

## Backend Auth (`auth`)
### Core
- Python 3.13
- Flask 3.1
- Flask-SQLAlchemy

### Securite
- bcrypt
- PyJWT
- cryptography

### Session et maintenance
- Redis client
- APScheduler

### Validation / support
- marshmallow-sqlalchemy
- python-dotenv
- requests
- watchdog
- python-json-logger
- ecs-logging

## Backend Lobby (`lobby`)
### Core
- Python 3.13
- Flask 3.1
- Flask-SocketIO 5.3.6
- simple-websocket

### Data / securite
- Flask-SQLAlchemy
- mysqlclient
- bcrypt
- PyJWT
- cryptography
- Redis client

### Support
- requests
- marshmallow-sqlalchemy
- python-dotenv
- watchdog

## Backend Game (`game`)
### Core
- Node.js 20
- NestJS 11
- TypeScript

### Temps reel / web
- Socket.IO (serveur)
- @nestjs/websockets
- @nestjs/platform-socket.io
- @nestjs/platform-express

### Validation / utilitaires
- class-validator
- class-transformer
- rxjs
- reflect-metadata
- getenv

### Logging
- winston
- nest-winston
- winston-logstash-transport

### Packages presents (non centraux au runtime principal)
- Prisma / @prisma/client / @prisma/adapter-mariadb (present dans deps)
- pixi.js et socket.io-client (presents dans package)

## Bases de donnees
- MariaDB 11.8
- `auth_db`: credentials + refresh tokens
- `user_db`: users, friends, card_gallery, gamestats

## Cache
- Redis 8.4 (service infra)

## Observabilite
- Elasticsearch 8.12.0
- Logstash 8.12.0
- Kibana 8.12.0

## Protocoles et formats
- HTTP/HTTPS
- WebSocket (Socket.IO)
- JSON (payload API/events/logs)
- SQL (schema MariaDB)
