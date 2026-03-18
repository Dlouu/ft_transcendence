from functools import wraps

from flask import g, request, session

from app.services import session_service as st


def _get_bearer_from_cookie():
    auth_header = request.cookies.get("session_token")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1]


def generate_token():
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            token = _get_bearer_from_cookie()
            if token and st.does_session_token_exist(token):
                g.token = token
                return f(*args, **kwargs)

            token, public, _private, _created_at = st.generate_session_token(
                session.get("user_id"),
                request.headers,
                request.remote_addr,
                request.args.get("code"),
            )
            st.store_session_token(token, public, session.get("user_id"), request.args.get("code"))
            g.token = token
            g.x_new_token = token

            return f(*args, **kwargs)
        return wrapped
    return decorator
