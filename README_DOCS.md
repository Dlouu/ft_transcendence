# Index Documentation

Ce dossier de documentation decrit l'architecture et le fonctionnement du projet UNO service par service.

## Sommaire rapide
- Vue globale techno: [docs/STACK_TECHNIQUE.md](docs/STACK_TECHNIQUE.md)
- Vocabulaire projet: [docs/GLOSSAIRE_TECHNIQUE.md](docs/GLOSSAIRE_TECHNIQUE.md)

## Services applicatifs
- Frontend web: [docs/SERVICE_WEBSITE.md](docs/SERVICE_WEBSITE.md)
- Reverse proxy: [docs/SERVICE_NGINX.md](docs/SERVICE_NGINX.md)
- API metier: [docs/SERVICE_API.md](docs/SERVICE_API.md)
- Authentification: [docs/SERVICE_AUTH.md](docs/SERVICE_AUTH.md)
- Lobby multijoueur: [docs/SERVICE_LOBBY.md](docs/SERVICE_LOBBY.md)
- Moteur de jeu UNO: [docs/SERVICE_GAME.md](docs/SERVICE_GAME.md)

## Services infrastructure
- Cache/session: [docs/SERVICE_REDIS.md](docs/SERVICE_REDIS.md)
- Base credentials: [docs/SERVICE_AUTH_DB.md](docs/SERVICE_AUTH_DB.md)
- Base metier: [docs/SERVICE_USER_DB.md](docs/SERVICE_USER_DB.md)
- Pipeline logs: [docs/SERVICE_LOGSTASH.md](docs/SERVICE_LOGSTASH.md)
- Stockage logs: [docs/SERVICE_ELASTICSEARCH.md](docs/SERVICE_ELASTICSEARCH.md)
- Visualisation logs: [docs/SERVICE_KIBANA.md](docs/SERVICE_KIBANA.md)

## Parcours recommande

### Parcours 1 - Comprendre vite le projet (15-20 min)
1. Lire [docs/STACK_TECHNIQUE.md](docs/STACK_TECHNIQUE.md)
2. Lire [docs/SERVICE_NGINX.md](docs/SERVICE_NGINX.md)
3. Lire [docs/SERVICE_API.md](docs/SERVICE_API.md)
4. Lire [docs/SERVICE_AUTH.md](docs/SERVICE_AUTH.md)
5. Lire [docs/SERVICE_LOBBY.md](docs/SERVICE_LOBBY.md)
6. Lire [docs/SERVICE_GAME.md](docs/SERVICE_GAME.md)
7. Finir par [docs/SERVICE_WEBSITE.md](docs/SERVICE_WEBSITE.md)

Pourquoi: ce parcours suit le flux reseau principal (entree Nginx -> API/Auth -> Lobby/Game -> UI).

### Parcours 2 - Onboarding developpeur backend
1. [docs/SERVICE_API.md](docs/SERVICE_API.md)
2. [docs/SERVICE_AUTH.md](docs/SERVICE_AUTH.md)
3. [docs/SERVICE_LOBBY.md](docs/SERVICE_LOBBY.md)
4. [docs/SERVICE_GAME.md](docs/SERVICE_GAME.md)
5. [docs/SERVICE_USER_DB.md](docs/SERVICE_USER_DB.md)
6. [docs/SERVICE_AUTH_DB.md](docs/SERVICE_AUTH_DB.md)
7. [docs/STACK_TECHNIQUE.md](docs/STACK_TECHNIQUE.md)

Pourquoi: commencer par les contrats et la logique metier, puis descendre vers la persistance.

### Parcours 3 - Onboarding developpeur frontend
1. [docs/SERVICE_WEBSITE.md](docs/SERVICE_WEBSITE.md)
2. [docs/SERVICE_NGINX.md](docs/SERVICE_NGINX.md)
3. [docs/SERVICE_API.md](docs/SERVICE_API.md)
4. [docs/SERVICE_LOBBY.md](docs/SERVICE_LOBBY.md)
5. [docs/SERVICE_GAME.md](docs/SERVICE_GAME.md)
6. [docs/GLOSSAIRE_TECHNIQUE.md](docs/GLOSSAIRE_TECHNIQUE.md)

Pourquoi: partir des pages/contexts puis remonter vers les evenements socket et endpoints consommes.

### Parcours 4 - Exploitation/Debug production
1. [docs/SERVICE_NGINX.md](docs/SERVICE_NGINX.md)
2. [docs/SERVICE_LOGSTASH.md](docs/SERVICE_LOGSTASH.md)
3. [docs/SERVICE_ELASTICSEARCH.md](docs/SERVICE_ELASTICSEARCH.md)
4. [docs/SERVICE_KIBANA.md](docs/SERVICE_KIBANA.md)
5. [docs/SERVICE_API.md](docs/SERVICE_API.md)
6. [docs/SERVICE_AUTH.md](docs/SERVICE_AUTH.md)

Pourquoi: prioriser point d'entree, logs, puis services applicatifs sources d'erreurs.

## Cartographie flux (resume)
- HTTP utilisateur: navigateur -> Nginx -> Website/API
- Auth: Website -> API -> Auth -> Auth DB (+ Redis)
- Lobby: Website <-> Lobby (Socket.IO)
- Game: Website <-> Game (Socket.IO), Lobby -> Game (REST)
- Stats fin de partie: Game -> API -> User DB
- Observabilite: services -> logs -> Logstash -> Elasticsearch -> Kibana

## Conseils de lecture
- Garder [docs/GLOSSAIRE_TECHNIQUE.md](docs/GLOSSAIRE_TECHNIQUE.md) ouvert pendant la lecture.
- Commencer par le parcours adapte a ton role, puis faire un second passage avec le parcours rapide.
- Pour debug d'un bug reel, combiner doc service + chaines de flux ci-dessus.
