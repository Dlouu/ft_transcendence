# Glossaire technique (projet UNO)

## Termes metier UNO
- UNO: annonce obligatoire quand un joueur n'a plus qu'une carte.
- Carte Wild: carte speciale qui permet de choisir une couleur.
- Carte +4 Wild: force le joueur suivant a piocher 4 cartes + choix de couleur.
- Skip: saute le tour du joueur suivant.
- Reverse: inverse le sens de jeu.
- +2: le joueur suivant pioche 2 cartes.
- Bot: joueur IA gere par le service `game`.
- Lobby host / supreme master: createur du lobby, responsable du lancement.
- Card back: dos de carte (theme ou image personnalisee).

## Termes d'architecture
- Microservices: decomposition en services specialises (`api`, `auth`, `game`, `lobby`, etc.).
- Reverse proxy: composant frontal (`nginx`) qui route HTTP/WS vers les bons services.
- WebSocket: canal bidirectionnel temps reel (ici via Socket.IO).
- REST API: endpoints HTTP orientes ressources (profil, stats, auth, etc.).
- DTO (Data Transfer Object): structure de payload partagee entre services.

## Termes auth/securite
- JWT: token signe representant une session utilisateur.
- Refresh token: token long terme permettant de regenerer un JWT.
- Cookie HttpOnly: cookie inaccessible JS (limite XSS sur token).
- Bearer token: format d'en-tete/cookie contenant un token.
- Secret header (`X-Secret-Author`): entete inter-service pour proteger certains endpoints (ex: stats).

## Termes base de donnees
- `auth_db`: base credentials/tokens.
- `user_db`: base metier users/friends/stats/gallery.
- ORM: mapping objets <-> tables SQL (SQLAlchemy).
- FK (Foreign Key): contrainte de relation entre tables.
- Cascade delete: suppression automatique des enregistrements dependants.

## Termes temps reel lobby/game
- `create_lobby`: event socket de creation de room.
- `join_lobby_request`: verification prealable de room.
- `join_lobby_socket`: rattachement effectif du socket a la room.
- `player_ready`: toggle pret/non-pret avant lancement.
- `master_start`: lancement de partie par l'host.
- `game:init:ready`: signal client indiquant qu'il est pret apres init.
- `game:turn:next`: evenement serveur pour annoncer le prochain tour.

## Termes observabilite
- ELK: Elasticsearch + Logstash + Kibana.
- Logstash pipeline: chaine input/filter/output de traitement logs.
- Indexation: operation de stockage de documents dans Elasticsearch.
- Dashboard: visualisation des logs et metriques dans Kibana.

## Termes frontend
- Context (React): mecanisme de partage d'etat global.
- ProtectedRoute: garde de navigation pour pages authentifiees.
- PixiJS: moteur 2D utilise pour afficher la table de jeu UNO.
- Vite: outil de build/dev serveur frontend.
