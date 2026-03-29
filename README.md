# ft_transcendence

A full-stack, real-time multiplayer **UNO** web application built as part of the 42 curriculum. The project is fully containerized using **Docker Compose** and follows a **microservices architecture**, with dedicated services for authentication, game logic, lobbies, the frontend website, and an observability stack.

---

## Features

### 🎮 Gameplay
- **Real-time multiplayer UNO** via WebSockets, rendered with **PixiJS**
- **Public lobbies** anyone can join, or **private lobbies** accessible by invite code

### 👤 Frontend Pages & Features
- **Login / Register** — account creation and sign-in
- **Profile** — view your own stats and info
- **User Profile** — view another player's public profile
- **Lobby** — create or join a game session (public or private by code)
- **Game** — live UNO game board
- **Friend List** — manage and view your friends
- **Gallery** — browse and view an image gallery
- **Paint** — in-browser drawing tool
- **Privacy Policy & Terms** — legal pages

### 🔒 Backend & Infrastructure
- **Gateway REST API** (`api`) — central hub that routes and proxies requests between all internal services; handles user profiles, UNO card collections, and exposes a unified interface to the frontend
- **Authentication service** (`auth`) — standalone JWT issuer with bcrypt password hashing, token refresh scheduling via APScheduler, and Redis-backed token caching
- **Game engine** (`game`, NestJS) — full server-side UNO logic including deck management, turn handling, card rules, scoring, and an AI bot opponent
- **Lobby service** (`lobby`) — manages game rooms (public & private by code), friend list logic, and real-time presence via Flask-SocketIO
- **Centralized logging** — Filebeat ships logs from all services into Elasticsearch, visualized through Kibana

---

## Architecture

The project is composed of the following services, all orchestrated by Docker Compose:

| Service           | Technology            | Role                                                    |
|-------------------|-----------------------|---------------------------------------------------------|
| `nginx`           | Nginx                 | Reverse proxy and TLS termination                       |
| `website`         | Node.js 20 / Vite     | Frontend SPA served on port `5173`                      |
| `api`             | Python 3.13 / Flask   | Gateway REST API — proxies all inter-service communication, user profiles, card data |
| `auth`            | Python 3.13 / Flask   | Authentication service (JWT, bcrypt, APScheduler, Redis token cache) |
| `game`            | Node.js 20 / NestJS   | Server-side UNO engine: deck, rules, turn logic, scoring, AI bot |
| `lobby`           | Python 3.13 / Flask-SocketIO | Game rooms (public & private by code), friends list, real-time presence |
| `auth_db`         | MariaDB               | Database for authentication data                        |
| `user_db`         | MariaDB               | Database for user/profile data                          |
| `redis`           | Redis 8.4             | Token cache and session store                           |
| `elasticsearch`   | Elasticsearch 8.12    | Log indexing and search                                 |
| `kibana`          | Kibana 8.12           | Log visualization dashboard                             |
| `filebeat`        | Filebeat 8.12         | Log shipping from all services to Elasticsearch         |

### Network Layout

Services communicate over isolated Docker bridge networks. Only `nginx`, `api`, `website`, `game`, and `lobby` are exposed to the host; everything else is internal.

```
Client → Nginx (8080/4443)
           ├── /api  → api (5050)
           ├── /auth → auth
           ├── /game → game
           ├── /     → website (5173)
           └── /lobby → lobby (5002)
```

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) plugin (included in modern Docker Desktop)
- `make`

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url> ft_transcendence
cd ft_transcendence
```

### 2. Configure environment variables

Copy the example env file and edit it if needed:

```bash
cp srcs/env.example srcs/.env
```

The default `.env` sets:

```dotenv
VOLUME_PATH=${PWD}/srcs/volumes   # where database & log volumes are stored on disk
TOKEN_CACHE_LIFETIME=86400        # JWT cache duration in seconds (24h)
```

Each service also has its own env file under `srcs/env/` (e.g. `api.env`, `auth.env`, `auth_db.env`, ...). Fill those in before starting.

### 3. Build and start all services

```bash
make
```

This is equivalent to `make build && make run` and will:
1. Create the required volume directories on the host.
2. Build all Docker images.
3. Start all containers in detached mode.

The application will be reachable at:
- **HTTPS** → `https://localhost:4443`
- **Kibana** → `http://localhost:5601`

---

## Makefile Reference

| Command                          | Description                                                  |
|----------------------------------|--------------------------------------------------------------|
| `make`                           | Build and start all services                                 |
| `make build [DOCK=service]`      | Build image(s) — omit `DOCK` to build everything            |
| `make run [DOCK=service]`        | Start container(s) in detached mode                          |
| `make stop [DOCK=service]`       | Stop and remove container(s)                                 |
| `make restart [DOCK=service]`    | Stop then rebuild and restart                                |
| `make logs [DOCK=service]`       | Tail logs for a service                                      |
| `make enter DOCK=service`        | Open an interactive shell inside a running container         |
| `make ps`                        | Show status of all containers                                |
| `make fclean`                    | **Full cleanup**: stop containers, remove volumes, prune images |
| `make re`                        | `fclean` + full rebuild                                      |

**Example** — rebuild and tail the API only:

```bash
make build DOCK=api
make run   DOCK=api
make logs  DOCK=api
```

---

## Project Structure

```
ft_transcendence/
├── Makefile
└── srcs/
    ├── docker-compose.yml          # Main service definitions
    ├── docker-compose.override.yml # Dev overrides (hot-reload, etc.)
    ├── filebeat.yml                # Filebeat log shipping config
    ├── env.example                 # Template for the root .env
    ├── env/                        # Per-service env files
    ├── volumes/                    # Persistent data (auto-created by make)
    └── containers/
        ├── services/
        │   ├── nginx/              # Reverse proxy config & Dockerfile
        │   ├── website/            # Frontend (Node.js / Vite)
        │   ├── api/                # Main REST API (Flask)
        │   ├── auth/               # Auth service (Flask + JWT)
        │   ├── game/               # Game engine (Node.js + WebSockets)
        │   └── lobby/              # Game rooms & friends (Flask-SocketIO)
        ├── databases/
        │   ├── auth_db/            # MariaDB for auth
        │   └── user_db/            # MariaDB for users
        └── utils/
            ├── game_dto/           # Shared game data transfer objects
            ├── mariadb_template/   # Reusable DB init scripts
            └── service_template/   # Boilerplate for new services
```

---

## Tech Stack Summary

| Layer           | Technology                             |
|-----------------|----------------------------------------|
| Frontend        | React 19, Vite, TailwindCSS 4, PixiJS, Socket.IO client |
| API (Gateway)   | Python 3.13, Flask, Flask-RESTX, Gunicorn, SQLAlchemy |
| Auth            | Python 3.13, Flask, PyJWT, bcrypt, APScheduler |
| Game            | Node.js 20, NestJS, WebSockets, TypeScript |
| Lobby           | Python 3.13, Flask-SocketIO            |
| Databases       | MariaDB (×2)                          |
| Cache           | Redis 8.4                             |
| Proxy           | Nginx                                  |
| Observability   | Elasticsearch 8.12, Kibana 8.12, Filebeat 8.12 |
| Containerization| Docker, Docker Compose                 |
