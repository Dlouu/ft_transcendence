# Service `api`

## Role
Le service `api` est la passerelle REST metier principale.
Il centralise les operations utilisateur et jeu cote base `user_db`, et delegue les operations d'authentification au service `auth`.

Il gere notamment:
- profil utilisateur
- mise a jour infos/password/suppression de compte
- upload avatars et cartes (via S3)
- lecture/ecriture des statistiques de jeu

## Stack
- Python 3.13 + Flask
- Flask-RESTX (namespaces + documentation API)
- SQLAlchemy / Marshmallow
- Redis (rate limiting et fallback memoire)
- Boto3 + Pillow (media)

## Entree et initialisation
- Entree: `srcs/containers/services/api/app/main.py`
- Factory app: `srcs/containers/services/api/app/__init__.py`
- API RESTX: `srcs/containers/services/api/app/api.py`

## Namespaces exposes
- `/auth` (registration/login/logout)
- `/user` (profil, media, galerie)
- `/user/game` (stats)

## Endpoints principaux
### Auth (proxy vers service auth)
- `POST /auth/registration`
- `PATCH /auth/login`
- `GET /auth/logout`

### Utilisateur
- `GET /user/me`
- `GET /user/me/<user_id>`
- `POST /user/update_information`
- `POST /user/update_password`
- `POST /user/delete_account`

### Profil et cartes
- `POST /user/update_profile_picture`
- `POST /user/select_card_image`
- `POST /user/upload_card_image`
- `POST /user/remove_card_image`
- `GET /user/get_card_images`
- `GET /user/get_card_images/<user_id>`

### Jeu / stats
- `POST /user/game/stats` (protege par header secret)
- `GET /user/game/stats/<user_id>`

## Persistance
Base `user_db` (MariaDB) avec tables:
- `users`
- `card_gallery`
- `friends`
- `gamestats`

Modele ORM principal dans:
- `app/models/user.py`
- `app/models/card_gallery.py`
- `app/models/gamestats.py`

## Integrations externes
- `auth` (requetes HTTP internes)
- AWS S3 (stockage avatars/cartes)
- `game` (envoi stats finales depuis game vers API)

## Authentification/session
- Cookie `session_token` (`Bearer ...`) pose via `after_request`.
- Decorateur JWT sur endpoints prives.

## Points d'attention
- Le login API est en `PATCH` cote gateway, mais appelle `POST /auth/login` cote auth.
- Les stats recues du service game utilisent une structure snake_case.
- Le service applique un rate-limit global (`10 requetes/seconde` par IP, fallback memoire).
