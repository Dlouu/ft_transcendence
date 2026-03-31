# Service `redis`

## Role
`redis` sert de couche cache/memoire rapide pour plusieurs services:
- stockage et verification de tokens/session (auth)
- support des controles de disponibilite token
- support du rate-limiting API

## Stack
- image Docker officielle `redis:8.4`

## Exposition reseau
Pas de port externe mappe par defaut dans `docker-compose.yml`.
Le service est accessible en interne Docker via le nom `redis` sur le reseau `redis_network`.

## Services dependants
- `auth`
- `api`
- `lobby` (reseau attache)

## Impact en cas de panne
- degradation forte des mecanismes de session/token
- refresh/login peuvent echouer selon les chemins
- rate-limiter API passe en fallback memoire pour certains cas

## Remarque
Le volume de logs est partage via `service_logs`, mais Redis reste un service d'infrastructure sans logique metier propre dans ce repo.
