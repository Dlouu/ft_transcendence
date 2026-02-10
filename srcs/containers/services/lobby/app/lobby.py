from flask import Flask, render_template, Blueprint, request, redirect, url_for
import random
import string
import os

lobby = Blueprint("lobby", __name__)

# In-memory lobby store:
# { "CODE": {"members": set([...])} }
lobbies = {}

# Optional Redis/JWT support: if REDIS_URL + deps are available, we'll
# resolve user_id from the session token in Redis. Otherwise we fallback
# to the provided user_id or token string.
try:
    import redis  # type: ignore
except Exception:
    redis = None

try:
    import jwt  # type: ignore
except Exception:
    jwt = None

_redis = None
if redis:
    redis_url = os.getenv("REDIS_URL", "")
    if redis_url:
        try:
            _redis = redis.from_url(redis_url, decode_responses=True)
        except Exception:
            _redis = None


@lobby.route("/")
def home():
    return render_template("home.html")


def unique_code():
    return "".join(random.choice(string.ascii_lowercase + string.digits, k=4))


def _normalize_code(value):
    return value.strip().upper()


def _decode_user_id_from_token(token):
    if not _redis or not jwt:
        return None
    try:
        data = _redis.hgetall(f"token:{token}")
        if not data or "public" not in data:
            return None
        payload = jwt.decode(token, data["public"], algorithms=["RS256"])
        return payload.get("user_id")
    except Exception:
        return None


def _get_member_id():
    # 1) Authorization header (Bearer <token>)
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1].strip()
        if token:
            user_id = _decode_user_id_from_token(token)
            return str(user_id).strip() if user_id else f"token:{token}"

    # 2) Cookies (if your auth sets one)
    cookie_uid = request.cookies.get("user_id") or request.cookies.get("lobby_member")
    if cookie_uid:
        return str(cookie_uid).strip()

    # 3) JSON body
    if request.is_json:
        data = request.get_json(silent=True) or {}
        user_id = data.get("user_id")
        if user_id:
            return str(user_id).strip()

    # 4) Form / query
    user_id = request.form.get("user_id") or request.args.get("user_id")
    if user_id:
        return str(user_id).strip()

    return None


def _get_lobby(code):
    lobby_data = lobbies.get(code)
    if lobby_data is None:
        return None
    lobby_data.setdefault("members", set())
    return lobby_data


# create a lobby
@lobby.route("/create_lobby", methods=["POST"])
def create_lobby():
    room_name = _normalize_code(request.form.get("room_name", ""))
    if not room_name:
        return "Room name is required", 601
    # 4 characteres uniquements + alnum
    if room_name in lobbies:
        return "Room already exists", 602
    member_id = _get_member_id()
    if not member_id:
        return "Missing authentication (provide Authorization or user_id).", 401
    if len(lobbies) >= 1679616:
        return "No more rooms avalaible", 603

    lobbies[room_name] = {"members": set([member_id])}

    response = redirect(url_for("lobby.join_lobby", code=room_name))
    response.set_cookie("lobby_member", member_id, httponly=True, samesite="Lax")
    return response


# joining lobby by code
@lobby.route("/join_lobby", methods=["POST"])
def join_lobby_post():
    member_id = _get_member_id()
    if not member_id:
        return "Missing authentication (provide Authorization or user_id).", 401
    user_code = _normalize_code(request.form.get("code", ""))
    lobby_data = _get_lobby(user_code)
    if not lobby_data:
        return "wrong room code", 404
    lobby_data["members"].add(member_id)
    response = redirect(url_for("lobby.join_lobby", code=user_code))
    response.set_cookie("lobby_member", member_id, httponly=True, samesite="Lax")
    return response


# joining lobby after creation
@lobby.route("/join_lobby", methods=["GET"])
def join_lobby():
    code = _normalize_code(request.args.get("code", ""))
    if not code:
        return "wrong room code", 404
    lobby_data = _get_lobby(code)
    if not lobby_data:
        return "wrong room code", 404
    member_id = _get_member_id()
    if not member_id:
        return "Missing authentication (provide Authorization or user_id).", 401
    lobby_data["members"].add(member_id)
    return render_template("game.html", code=code)


def remove_lobby(code):
    if code in lobbies:
        lobbies.pop(code, None)


'''
Pouvoir créer des lobbies, le lobbies peut être privé ou publique, le lobbie a un nombre maximum de joueur, le lobbie doit être supprimé au bout d'un certain temps

lobby public ou prive
max_joueur < 5
si au bout de 10 mins le lobby n'est pas plein, il est supprimé
'''
