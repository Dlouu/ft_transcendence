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
Copy the default environment variables folder `env.example` to `env` and edit the files if needed:
```bash
cp -r srcs/env.example srcs/env
```
This will provide every internal service with its own individual configuration file (e.g. `api.env`, `auth.env`, `auth_db.env`, etc.). Review and fill them in as needed before proceeding.

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
- `make command [DEV=1]` - Use the dev branch

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
- **Marie** (Product Owner + Developers): *[Brief description of their responsibilities]*
- **Yohann** (Project Manager + Developers): *[Brief description of their responsibilities]*
- **Theo** (Technical Lead + Developers): *[Brief description of their responsibilities]*
- **Nils** (Developers + Developers): *[Brief description of their responsibilities]*

---

## Project Management
- **Organization:** *[Explain how task distribution and meetings were managed]*
- **Tools Used:** Github, Notion
- **Communication Channels:** Discord

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
- **Real-time multiplayer UNO** (WebSockets + PixiJS) - *Implemented by Yohann* - Features full deck mechanics, real-time turns, and rule validation.
- **Public & Private Lobbies** - *Implemented by Nils* - Create accessible rooms for specific invite codes.
- **AI Opponent** - *Implemented by Yohann* - Bot logic engineered via NestJS services.

### 👤 User Pages & Flow
- **Authentication** - *Implemented by Theo and Nils* - Login, Register, JWT, Bcrypt.
- **Profile / User Profile** - *Implemented by Marie and Theo* - View global stats and information.
- **Friend List** - *Implemented by Nils and Marie* - Manage and view online friends.
- **Gallery / Paint** - *Implemented by Marie* - In-browser drawing tool and custom card image upload via AWS S3.

### 🔒 Backend & Infrastructure
- **Gateway REST API** - *Implemented by Theo* - Central hub that routes and proxies requests between internal services.
- **Centralized logging** - *Implemented by Theo* - Logstash pipelines ship logs to Elasticsearch and visualize on Kibana.
- **Authentication service** - *Implemented by Nils and Theo* - Handles user login, authentication flows, and secure token generation for access control.
- **User management service** - *Implemented by Nils* - Manages user-related features including lobby system and friend list functionality.
- **Nginx reverse proxy & security** - *Implemented by Theo* - Configured HTTPS with TLS, HTTP-to-HTTPS redirection, implemented reverse proxy routing for API and frontend services, and enabled WebSocket support for real-time lobby and game services.
---

## Modules

The project follows a set of specific modules chosen from the 42 curriculum. Below is the point evaluation block:

### Major Modules (2 Points Each)
- **Use a framework for both the frontend and backend** (React + Vite / Flask + NestJS). *Implemented by: Marie*
- **Implement real-time features using WebSockets or similar technology**. *Implemented by: Nils and Yohann*
- **Allow users to interact with other users** (Profile, Friends). *Implemented by: Marie and Nils*
- **A public API to interact with the database**. *Implemented by: Theo*
- **Standard user management and authentication**. *Implemented by: Theo*
- **Introduce an AI Opponent for games**. *Implemented by: Yohann*
- **Implement a complete web-based game where users can play against each other**. *Implemented by: Marie, Nils, Yohann*
- **Remote players — Enable two players on separate computers to play the same game in real-time**. *Implemented by: Yohann*
- **Multiplayer game (more than two players)**. *Implemented by: Yohann*
- **Infrastructure for log management using ELK**. *Implemented by: Theo*
- **Backend as microservices**. *Implemented by: Theo*

### Minor Modules (1 Point Each)
- **Use a frontend framework**. *Implemented by: Yohann and Marie*
- **Use a backend framework**. *Implemented by: Nils, Theo, Yohann*
- **Use an ORM for the database** (Flask-SQLAlchemy). *Implemented by: Theo, Nils*
- **Custom-made design system with reusable components**. *Implemented by: Marie*
- **Support for additional browsers** (Tested on Chrome, Firefox, Brave). *Implemented by: Marie, Yohann*
- **Custom Minor Module: AWS Image Storage** (AWS S3 utilized to store gallery images/avatars efficiently). *Justification: Chosen to safely and persistently host user content while reducing database sizes and network payload strain.* *Implemented by: Theo.*

---

## Browser Compatibility
The application is strictly tested and is verified to fully function on the current newest versions of:
- Google Chrome
- Mozilla Firefox
- Brave Browser

---

## Individual Contributions
- **Marie**: *[Detailed breakdown of contributions. E.g., created the React component design system.]*
- **Yohann**: *[Detailed breakdown of contributions. E.g., Built the NestJS game backend, programmed the UNO core logic with AI bot opponent, and solved WebSockets synchronization delays.]*
- **Nils**: Developed a WebSocket-based lobby system enabling real-time interactions, and implemented a complete friend management system including user relationships and social features
- **Theo**: Implemented Flask-based gateway APIs acting as the central entry point of the system, designed and deployed the ELK logging stack (Elasticsearch, Logstash, Kibana) for centralized monitoring, integrated AWS S3 for scalable user gallery storage, and defined robust MariaDB relational constraints to ensure data integrity. Led the configuration of Nginx as a secure reverse proxy with HTTPS, routing, and WebSocket support, and played a key role in designing the overall microservices architecture. Contributed to core backend infrastructure including authentication mechanisms (login, token generation). Faced challenges related to orchestrating a distributed microservices architecture, securing inter-service communication, and implementing a zero-trust API approach. Addressed these by enforcing strict access control, token-based authentication, and secure service isolation to reduce attack surfaces and prevent unauthorized access.
