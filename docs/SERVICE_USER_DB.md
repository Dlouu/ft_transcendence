# Service `user_db`

## Role
`user_db` stocke les donnees metier du produit UNO:
- profil public
- galerie de cartes
- relations d'amis
- statistiques de parties

## Stack
- MariaDB 11.8

## Initialisation
Le Dockerfile copie:
- configuration MariaDB (`50-server.cnf`)
- scripts SQL d'init (`tools/sql/schema.sql`)
- script bootstrap (`tools/script.sh`)

## Base et schema
Base creee: `users_data`

Tables principales:
- `users`
  - `user_id` (id externe), `username`, `profile_picture_url`, `card_back_id`, `is_active`
- `card_gallery`
  - cartes personnalisees, FK vers `users(user_id)`
- `friends`
  - paires requester/accepter + statut (`pending`, `accepted`, `rejected`, `blocked`)
- `gamestats`
  - compteurs de parties et indicateurs UNO

## Services dependants
- `api` (principal)
- `lobby` (lecture users/friends pour presence et lobby state enrichi)

## Flux de donnees typiques
- inscription: `api` cree le user metier apres creation credential dans `auth`
- fin de partie: `game` poste vers `api`, qui upsert/met a jour `gamestats`
- lobby/friends: `lobby` lit users/friends pour statuses temps reel

## Volume
Le volume host est monte sur `srcs/volumes/user_db_volume`.
