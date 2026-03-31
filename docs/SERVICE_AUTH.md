# Service `auth`

## Role
Le service `auth` gere toute la securite des comptes:
- creation de credentials
- verification login/password
- generation et rotation des tokens de session
- refresh token lifecycle
- mise a jour email/username/password

Il utilise la base `auth_db` (isolee de `user_db`).

## Stack
- Python 3.13 + Flask
- SQLAlchemy
- bcrypt
- PyJWT
- Redis
- APScheduler (maintenance refresh tokens)

## Entree et assemblage
- Entree: `srcs/containers/services/auth/app/main.py`
- Factory app: `srcs/containers/services/auth/app/__init__.py`

Blueprints exposes:
- `/auth`
- `/token_handler`
- `/user`
- `/` (OAuth 42)

## Endpoints principaux
### Auth
- `POST /auth/registration`
- `POST /auth/login`

### Token
- `GET /token_handler/update` (regenere un session token via refresh token)

### User credentials
- `POST /user/update_information`
- `POST /user/update_password`
- `POST /user/delete_account`
- `GET /user/email/<user_id>`

### OAuth 42
- `GET /oauth/42`
- `GET /oauth/42/callback`

## Donnees gerees
Dans `auth_db`:
- `credentials` (username, email, password hash)
- `refresh_token`
- `refresh_token_rules`

## Securite
- Hash password avec bcrypt
- JWT de session (stockage metadonnees en Redis)
- Refresh token rotation
- Decorateurs de sante DB/Redis sur endpoints critiques

## Interactions inter-services
- Le service `api` appelle `auth` pour registration/login/update/delete
- Le frontend n'appelle pas `auth` directement dans le chemin nominal

## Points d'attention
- Les donnees utilisateur metier (avatar/stats/friends) ne sont pas ici, elles sont dans `user_db` via `api`.
- Si Redis est indisponible, la gestion des sessions/tokens est impactee.
