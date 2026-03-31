# Service `website`

## Role
Le service `website` fournit l'interface utilisateur du projet UNO (React + Vite), incluant:
- authentification (login/register)
- lobby multijoueur
- rendu du jeu (PixiJS)
- profil, amis, galerie, paint

En production, ce service est build puis servi statiquement (`serve -s dist -l 5173`). En developpement, il tourne avec `vite --host`.

## Stack
- Node.js 20 (Docker)
- React 19
- Vite 7
- React Router
- TailwindCSS 4
- Socket.IO Client
- PixiJS

## Point d'entree et routes frontend
- Entree React: `srcs/containers/services/website/app/src/main.jsx`
- Routeur principal: `srcs/containers/services/website/app/src/App.jsx`

Routes principales:
- `/` (home ou login selon session)
- `/register`
- `/me`
- `/profile/:id`
- `/lobby/:id`
- `/game`
- `/gallery`, `/gallery/all`, `/gallery/:id`
- `/paint`
- `/terms`, `/privacy`

## Communication avec le backend
### HTTP (via Nginx)
Tous les appels passent par `/api/*`:
- session user: `GET /api/user/me`
- auth: `/api/auth/registration`, `/api/auth/login`, `/api/auth/logout`
- stats: `GET /api/user/game/stats/:id`
- profil, galerie, upload image, etc.

### WebSocket
- Lobby: `https://<host>:4443` + path `/wslobby/`
- Game: `https://<host>:4443` + path `/wsgame`

## Etats et contexts React
- `AuthContext`: etat session utilisateur + refresh/logout
- `LobbyContext`: etat lobby, events socket lobby, amis
- `GameContext`: etat global de partie
- `AlertContext`: notifications UI

## Evenements lobby utilises (client)
Emis:
- `create_lobby`, `join_lobby_request`, `join_lobby_socket`
- `player_ready`, `add_bot`, `remove_bot`, `master_start`
- `set_theme`, `set_privacy`
- `add_friend`, `accept_friend`, `reject_friend`, `remove_friend`, `get_friends`
- `leave_lobby`, `game_ended_notify`

Recus:
- `lobby_state`, `public_lobbies`, `game_start`
- `ongoing_game`, `in_pending_lobby`, `game_ended`
- `friends_list`, `friend_status`, `friend_updated`, `friend_removed`
- `error`, `room_full`

## Evenements game utilises (client)
Emis:
- `game:init:ready`
- `game:play:card`
- `game:play:draw`
- `game:play:uno`
- `game:wild:color-picked`

Recus (principaux):
- `game:init`, `game:start`, `game:join`, `game:rejoin`
- `game:turn:next`
- `game:played:card:self`, `game:played:card:others`
- `game:draw:self`, `game:draw:others`
- `game:wild:choose-color`, `game:wild:new-color`
- `game:uno:*`, `game:turn:timeout`, `game:deck:*`
- `game:win`

## Donnees metier importantes
- Les stats backend reviennent en snake_case (`games_played`, `games_won`, etc.) puis sont mappees vers l'UI.
- Les medias utilisateur (avatar, card back) sont utilises avec cache-busting cote frontend.

## Points d'attention
- Le service frontend ne contient pas la logique UNO serveur: il affiche et envoie des actions.
- La gestion socket est imperative (notamment pour Pixi), donc attention aux boucles init/destroy sur rerender React.
- Le mode dev partage les DTO game depuis `srcs/containers/utils/game_dto` pour aligner frontend/backend.
