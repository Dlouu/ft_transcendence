from functools import wraps

from flask import g, request, session
from jwt import exceptions as jwt_exceptions

from app.services import session_service as st


def _get_bearer_from_cookie():
    auth_header = request.cookies.get("session_token")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1]


def _get_bearer_from_header():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1]


def _get_token_from_args():
    return request.args.get("token") or request.args.get("session_token")


def check_token():
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            token = getattr(g, "token", None) or _get_bearer_from_cookie() or _get_bearer_from_header() or _get_token_from_args()

            if not token:
                return False

            if not st.does_session_token_exist(token):
                return False

            try:
                payload = st.decode_session_token(token)
            except jwt_exceptions.ExpiredSignatureError:
                return False
            except jwt_exceptions.PyJWTError:
                return False

            if not payload:
                return False

            g.token = token
            g.token_payload = payload

            user_id = payload.get("user_id") if isinstance(payload, dict) else None
            if user_id is not None:
                session["user_id"] = user_id

            return f(*args, **kwargs)
        return wrapped
    return decorator
