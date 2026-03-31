# Service `nginx`

## Role
Le service `nginx` est le reverse proxy frontal du projet:
- termine TLS (HTTPS)
- redirige HTTP -> HTTPS
- route les requetes HTTP vers `website` et `api`
- route les WebSockets vers `lobby` et `game`

## Stack
- nginx 1.29 alpine
- OpenSSL (generation certificat self-signed)

## Exposition reseau
- Interne container: `80`, `443`
- Externe compose: `8080:80`, `4443:443`

## Routage configure
Configuration dans `srcs/containers/services/nginx/tools/nginx.conf`:
- `/api/` -> `http://api:5050/`
- `/` -> `http://website:5173`
- `/wslobby/` -> `http://lobby:5002/socket.io/`
- `/wsgame/` -> `http://game:3000/socket.io/`

## WebSocket
Nginx force les headers necessaires:
- `Upgrade`
- `Connection`
- `X-Forwarded-*`
- timeout lecture long (`proxy_read_timeout 86400`)

## Securite
Headers presents:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection`

## Certificats
Dans le Dockerfile, un certificat auto-signe est genere au build.
Ce setup est adapte au dev/local; en production reelle il faut un certificat valide (Let's Encrypt ou equivalent).

## Position dans l'architecture
Tous les clients web passent par `nginx`.
Aucun service backend n'est expose directement sur Internet dans le parcours nominal.
