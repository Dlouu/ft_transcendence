# Service `auth_db`

## Role
`auth_db` stocke les donnees sensibles d'authentification.
Il est dedie au service `auth` pour separer credentials et donnees metier.

## Stack
- MariaDB 11.8

## Initialisation
Le Dockerfile copie:
- configuration MariaDB (`50-server.cnf`)
- scripts SQL d'init (`tools/sql/schema.sql`)
- script bootstrap (`tools/script.sh`)

## Base et schema
Base creee: `auth_data`

Tables:
- `credentials`
  - `id`, `username`, `email`, `password`
  - unique sur `email`
- `refresh_token`
  - `user_id`, `last_token`, `active_token`, `expire_date`
- `refresh_token_rules`
  - rattachee a `refresh_token` via FK (`token_id`)
  - suppression en cascade

## Usage
- lue/ecrite par `auth`
- pas d'acces direct depuis frontend
- `api` passe indirectement par `auth` (proxy inter-service)

## Volume
Le volume host est monte sur `srcs/volumes/auth_db_volume`.

## Point d'architecture
Cette base ne contient pas de stats/profil/amis: uniquement l'identite et les mecanismes de token d'authentification.
