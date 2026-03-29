*This project has been created as part of the 42 curriculum by [Login 1], [Login 2], [Login 3]*

# ft_transcendence

## Description
**ft_transcendence** is a full-stack, real-time multiplayer **UNO** web application. 
The goal of the project is to create a fully functioning online game, adhering to modern web development practices. It is fully containerized using **Docker Compose** and follows a **microservices architecture**, with dedicated services for authentication, game logic, lobbies, the frontend website, and an observability stack.

### Key Aspects
- **Real-time multiplayer UNO** via WebSockets, rendered with **PixiJS**.
- **Public lobbies** anyone can join, and **private lobbies** accessible by invite code.
- **Microservices architecture** using Nginx as a reverse proxy to route requests between Nginx, custom Gateway API, User Database, Auth Database, game service, lobby service, and Website service.

---

## Instructions

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) plugin (included in modern Docker Desktop)
- `make`

### Configuration
Copy the example env file and edit it:
```bash
cp srcs/env.example srcs/.env
```
The default `.env` sets:
```dotenv
VOLUME_PATH=${PWD}/srcs/volumes   # where database & log volumes are stored on disk
TOKEN_CACHE_LIFETIME=86400        # JWT cache duration in seconds (24h)
```
Each internal service also has its own `.env` file located in the `srcs/env/` folder (e.g. `api.env`, `auth.env`, `auth_db.env`). Fill those in as needed before starting.

### Execution
To build and start all the services:
```bash
make
```
This command runs `make build` followed by `make run` to:
1. Create the required volume directories on the host.
2. Build all Docker images.
3. Start all containers in detached mode.

The application will be reachable at:
- **HTTPS** → `https://localhost:4443`
- **Kibana** → `http://localhost:5601`

**Makefile Reference**:
- `make` - Build and start all services
- `make build [DOCK=service]` - Build image(s)
- `make run [DOCK=service]` - Start container(s)
- `make stop [DOCK=service]` - Stop and remove container(s)
- `make restart [DOCK=service]` - Stop then rebuild and restart
- `make logs [DOCK=service]` - Tail logs for a service
- `make fclean` - Stop containers, remove volumes, prune images

---

## Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PixiJS Documentation](https://pixijs.com/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- **AI Usage:** *[Explain how AI was used, e.g., to generate structural boilerplate, handle repetitive CSS refactoring, or help debug Docker container networking.]*

---

## Team Information
- **[Team Member 1]** (Role, e.g., Tech Lead): *[Brief description of their responsibilities]*
- **[Team Member 2]** (Role, e.g., Frontend Developer): *[Brief description of their responsibilities]*
- **[Team Member 3]** (Role, e.g., Backend Developer): *[Brief description of their responsibilities]*

---

## Project Management
- **Organization:** *[Explain how task distribution and meetings were managed]*
- **Tools Used:** *[e.g., GitHub Issues, Trello, Notion]*
- **Communication Channels:** *[e.g., Discord, Slack]*

---

## Technical Stack

### Frontend
- **Frameworks:** React 19, Vite
- **Styling:** TailwindCSS 4
- **Game Rendering:** PixiJS
- **Real-Time Communication:** Socket.IO Client

### Backend
- **Gateway REST API:** Python 3.13, Flask, Flask-RESTX, SQLAlchemy
- **Authentication Service:** Python 3.13, Flask, PyJWT, bcrypt, APScheduler
- **Game Engine:** Node.js 20, NestJS, TypeScript
- **Lobby Service:** Python 3.13, Flask-SocketIO

### Database & Cache
- **Database System:** MariaDB (Used as two separate databases: `auth_db` and `user_db`). *[Justification: Selected for its reliability in handling structured relational data like users, game statistics, and friends lists.]*
- **Cache System:** Redis 8.4 (Used for token cache and rapid session storage tracking).

### Observability & Infrastructure
- **Proxy:** Nginx
- **Containerization:** Docker, Docker Compose
- **Log Management:** Elasticsearch 8.12, Kibana 8.12, Logstash 8.12

---

## Database Schema
The database architecture is split across two separate MariaDB instances (`auth_db` and `user_db`) to enforce microservices design.
- **`auth_db`**: Stores sensitive authentication credentials, passwords, and tokens.
- **`user_db`**: Stores relational models for:
  - Users (username, avatar, custom cards, global statistics)
  - Friends (Add/remove logic and relationships)
  - Game Stats (Wins, losses)
  - Card Gallery (AWS S3 Image URLs for custom uploaded cards)
*[Provide a visual image representation of the database schema here if you have one]*

---

## Features List

### 🎮 Gameplay
- **Real-time multiplayer UNO** (WebSockets + PixiJS) - *Implemented by [Member]* - Features full deck mechanics, real-time turns, and rule validation.
- **Public & Private Lobbies** - *Implemented by [Member]* - Create accessible rooms for specific invite codes.
- **AI Opponent** - *Implemented by [Member]* - Bot logic engineered via NestJS services.

### 👤 User Pages & Flow
- **Authentication** - *Implemented by [Member]* - Login, Register, JWT, Bcrypt.
- **Profile / User Profile** - *Implemented by [Member]* - View global stats and information.
- **Friend List** - *Implemented by [Member]* - Manage and view online friends.
- **Gallery / Paint** - *Implemented by [Member]* - In-browser drawing tool and custom card image upload via AWS S3.

### 🔒 Backend & Infrastructure
- **Gateway REST API** - *Implemented by [Member]* - Central hub that routes and proxies requests between internal services.
- **Centralized logging** - *Implemented by [Member]* - Logstash pipelines ship logs to Elasticsearch and visualize on Kibana.

---

## Modules

The project follows a set of specific modules chosen from the 42 curriculum. Below is the point evaluation block:

### Major Modules (2 Points Each)
- **Use a framework for both the frontend and backend** (React + Vite / Flask + NestJS). *Implemented by: [Member]*
- **Implement real-time features using WebSockets or similar technology**. *Implemented by: [Member]*
- **Allow users to interact with other users** (Profile, Friends). *Implemented by: [Member]*
- **A public API to interact with the database**. *Implemented by: [Member]*
- **Standard user management and authentication**. *Implemented by: [Member]*
- **Introduce an AI Opponent for games**. *Implemented by: [Member]*
- **Implement a complete web-based game where users can play against each other**. *Implemented by: [Member]*
- **Remote players — Enable two players on separate computers to play the same game in real-time**. *Implemented by: [Member]*
- **Multiplayer game (more than two players)**. *Implemented by: [Member]*
- **Infrastructure for log management using ELK**. *Implemented by: [Member]*
- **Backend as microservices**. *Implemented by: [Member]*

### Minor Modules (1 Point Each)
- **Use a frontend framework**. *Implemented by: [Member]*
- **Use a backend framework**. *Implemented by: [Member]*
- **Use an ORM for the database** (Flask-SQLAlchemy). *Implemented by: [Member]*
- **Custom-made design system with reusable components**. *Implemented by: [Member]*
- **Support for additional browsers** (Tested on Chrome, Firefox, Brave). *Implemented by: [Member]*
- **Custom Minor Module: AWS Image Storage** (AWS S3 utilized to store gallery images/avatars efficiently). *Justification: Chosen to safely and persistently host user content while reducing database sizes and network payload strain.* *Implemented by: [Member]*

---

## Browser Compatibility
The application is strictly tested and is verified to fully function on the current newest versions of:
- Google Chrome
- Mozilla Firefox
- Brave Browser

---

## Individual Contributions
- **[Team Member 1]**: *[Detailed breakdown of contributions. E.g., Designed the ELK logging stack, created the React component design system, and navigated Docker networking difficulties.]*
- **[Team Member 2]**: *[Detailed breakdown of contributions. E.g., Built the NestJS game backend, programmed the UNO core logic with AI bot opponent, and solved WebSockets synchronization delays.]*
- **[Team Member 3]**: *[Detailed breakdown of contributions. E.g., Implemented Flask-based gateway APIs, integrated AWS S3 bucket handling for user galleries, and structured MariaDB relational constraints.]*
