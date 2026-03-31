# Service `game`

## Role
Le service `game` implemente le moteur UNO temps reel:
- creation de partie
- validation des coups
- gestion des tours, effets de cartes, UNO
- bots
- synchronisation Socket.IO de l'etat de jeu
- emission des resultats finaux

## Stack
- Node.js 20
- NestJS 11
- Socket.IO
- TypeScript
- Winston/Logstash transport

## Entree et architecture
- Entree: `srcs/containers/services/game/app/src/main.ts`
- Module: `game.module.ts`
- Controller REST: `game.controller.ts`
- Gateway WS: `game.gateway.ts`
- Services metier: `game.service.ts`, `game-logic.service.ts`, `game-play.service.ts`, `deck.service.ts`, `bot-logic.service.ts`
- Stockage en memoire: `game-repository.ts`

## Endpoints REST exposes
- `POST /game/create`
- `POST /game/rejoin`

Ces endpoints sont utilises surtout par le service `lobby`.

## Evenements WebSocket (principaux)
### Cote client -> serveur
- `game:init:ready`
- `game:play:card`
- `game:play:draw`
- `game:play:uno`
- `game:wild:color-picked`

### Cote serveur -> clients
- `game:join`, `game:rejoin`, `game:init`, `game:start`
- `game:turn:next`, `game:turn:reverse`, `game:turn:timeout`
- `game:played:card:self`, `game:played:card:others`
- `game:draw:self`, `game:draw:others`
- `game:wild:choose-color`, `game:wild:new-color`
- `game:uno:*`
- `game:deck:empty`, `game:deck:shuffled`
- `game:win`

## Regles/config importantes
Configuration dans `srcs/containers/services/game/app/src/game.config.ts`:
- timeout tour: 10s
- timeout choix couleur wild: 10s
- fenetre UNO: 100000ms
- 7 cartes initiales par joueur
- bots avec delais parametrables

## DTO partages
Le dossier `srcs/containers/utils/game_dto` est monte dans:
- `game` (source de verite backend)
- `website` (consommation frontend)

Cela reduit les desalignements de contrats.

## Interactions inter-services
- Recoit creation/rejoin depuis `lobby`
- En fin de partie, poste les stats vers `api` (`/user/game/stats`)
- Tente de notifier/supprimer le lobby termine via `lobby` (`/lobby/delete`)

## Persistance
Le moteur conserve les parties en memoire (RAM), pas en base durable.

## Points d'attention
- Redemarrage du service => perte des parties en cours.
- Une TODO est presente dans `game-repository.ts` sur la verification de la route de suppression lobby.
- CORS websocket est ouvert (`origin: *`) dans la gateway.
