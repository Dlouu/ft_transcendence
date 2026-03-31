# Service `lobby`

## Role
Le service `lobby` gere l'avant-partie multijoueur:
- creation/rejoindre une room
- etat des joueurs (ready, host)
- ajout/suppression de bots
- privacy public/prive
- lancement de partie vers `game`
- rejoin apres deconnexion
- mecanique sociale (friends via Socket.IO)

## Stack
- Python 3.13 + Flask
- Flask-SocketIO
- SQLAlchemy (optionnel, selon variable DB)
- Redis (present dans architecture globale)
- Requests (appels internes)

## Entree et assemblage
- Entree: `srcs/containers/services/lobby/app/main.py`
- Factory app: `srcs/containers/services/lobby/app/__init__.py`
- Evenements lobbies: `app/lobbies/socket_events.py`
- Evenements amis: `app/friends/socket_events.py`
- Etat in-memory: `app/core/state.py`

## Stockage d'etat
Structures principales en memoire:
- `lobbies`: code -> objet lobby
- `socketid_lobby`: socket id -> code lobby
- `players_in_game`: set des joueurs en partie
- `players_left_game`: suivi des joueurs sortis en cours de game

## Evenements Socket.IO lobbies
- `connect`
- `get_public_lobbies`
- `create_lobby`
- `join_lobby_request`
- `join_lobby_socket`
- `player_ready`
- `add_bot`, `remove_bot`
- `set_theme`, `set_privacy`
- `master_start`
- `leave_lobby`
- `disconnect`
- `game_ended_notify`

Evenements emis (principaux):
- `lobby_state`
- `public_lobbies`
- `game_start`
- `ongoing_game`
- `in_pending_lobby`
- `game_ended`
- `error`, `room_full`

## Evenements Socket.IO social/friends
- `get_friends`
- `add_friend`
- `accept_friend`
- `reject_friend`
- `remove_friend`
- `get_friend_status`

Emits:
- `friends_list`
- `friend_request_sent`
- `friend_updated`
- `friend_removed`
- `friend_status`

## Endpoint REST local
- `POST /lobby/delete`

Utilise par le service `game` en fin de partie pour cleanup d'un lobby.

## Flux de demarrage de partie
1. host fait `master_start`
2. lobby valide contraintes (joueurs, ready, capacite)
3. lobby construit payload et appelle `POST http://game:3000/game/create`
4. lobby marque `game_started = true` et emit `game_start`

## Integrations
- lit les users dans `user_db` (username, avatar, card back)
- appelle `game` pour create/rejoin
- notifie presence des amis en temps reel

## Points d'attention
- Une partie de l'etat est strictement en memoire (perte au restart).
- Le fichier `srcs/containers/services/lobby/TODO` mentionne des chantiers (full WS flow, gestion token/cookies, tests de rejets).
- Le serveur refuse la selection d'un code room fourni par le client lors de `create_lobby`.
