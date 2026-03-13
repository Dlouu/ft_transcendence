from flask import Blueprint, render_template, request, redirect, url_for, session, make_response, g
from app.core.state import lobbies, three_letters, four_letters
from app.lobbies.services import lobby_removal
from app.services import session_service as st
import random
import string
import os

lobby = Blueprint("lobby", __name__)
MAX_LOBBIES = 36 ** 4
MAX_RANDOM_ATTEMPTS = 100

def generate_room_code_second_edition():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4)).upper()


def generate_room_code_first_edition():
    random_value = random.randint(0, 2)
    if random_value == 0:
        room_name = str(random.randint(1, 9)) + random.choice(three_letters)
    elif random_value == 1:
        room_name = random.choice(three_letters) + str(random.randint(1, 9))
    else:
        room_name = random.choice(four_letters)
    return room_name.upper()


def generate_code():
    for _ in range(MAX_RANDOM_ATTEMPTS):
        if len(lobbies) < 1015:
            room_name = generate_room_code_first_edition()
        else:
            room_name = generate_room_code_second_edition()

        if room_name not in lobbies:
            return room_name, None
    return None, ("Failed to generate unique room", 602)

def create_lobby_or_error(requested_code=None):
    if len(lobbies) > MAX_LOBBIES:
        return None, ("No more rooms available", 603)

    if requested_code is not None:
        room_name = str(requested_code).strip().upper()
        if not room_name or not room_name.isalnum() or len(room_name) != 4:
            return None, (
                "Room name must contain only alphanumeric characters and be exactly 4 characters long",
                601,
            )
        if room_name in lobbies:
            return None, ("Room already exists", 602)
    else:
        room_name, error = generate_code()
        if error:
            return None, error

    lobbies[room_name] = {
        "players": {},  # {sid: {ready, connected, user_id}}
        "bots": 0,
        "game_started": False,
        "game_ended": False,
        "theme": False,
        "supreme_master_user_id": session.get("user_id"),
        "supreme_master_sid": None,
        "supreme_master_starts": False,
        "privacy": True,
    }

    lobby_removal(room_name, delay=600)
    return room_name, None


def _set_session_cookie(response, token):
    if not token:
        return response
    
    response.set_cookie(
            "session_token",
            f"Bearer {token}",
            httponly=True,
            secure=True,
            samesite="None",
            max_age=int(os.getenv("TOKEN_CACHE_LIFETIME", "3600"))
    )
    return response

"""
Just here for dev
GET /
📥 Receives:
- HTTP GET request

📤 Returns:
- HTML template "home.html"

🎯 Purpose:
Displays the homepage.
"""
@lobby.route("/")
def home():
    return render_template("home.html")

"""
POST /create_lobby

📥 Receives:
- code (optional, form or JSON)
- user_id (session)

📤 Returns:
- Redirect to /lobby/<code> if successful
- Error message with custom status codes (601, 602, 603) otherwise

🎯 Purpose:
Creates a new lobby after validating:
- Name format
- Room uniqueness
- Maximum room limit

Initializes lobby data and starts an expiration timer.
"""
@lobby.route("/create_lobby", methods=["POST"])
def create_lobby():
    payload = request.get_json(silent=True) or {}
    requested_code = (
        request.form.get("code")
        or request.form.get("room_name")
        or payload.get("code")
        or payload.get("room_name")
    )
    room_name, error = create_lobby_or_error(requested_code)
    if error:
        message, status = error
        return message, status

    token, public, private, created_at = st.generate_session_token(
        session.get("user_id"),
        request.headers,
        request.remote_addr,
        room_name,
    )
    st.store_session_token(token, public, session.get("user_id"), room_name)
    response = make_response(redirect(url_for("lobby.lobby_room", code=room_name)))
    return _set_session_cookie(response, token)

"""
GET /lobby/<code>

📥 Receives:
- code (path parameter)

📤 Returns:
- HTML template "lobby.html"

🎯 Purpose:
Displays the lobby page for a given code.
"""
@lobby.route("/lobby/<code>", methods=["GET"])
def lobby_room(code):
    if not code:
        return redirect(url_for("lobby.home"))
    code = code.strip().upper()
    return render_template("lobby.html", code=code)

"""
GET|POST /join_lobby

📥 Receives:
- code (query parameter or form field)

📤 Returns:
- HTML template "lobby.html"
- Error message if creation fails

🎯 Purpose:
Single entry point to either create a lobby (no code)
or join an existing one (with code).
"""
@lobby.route("/join_lobby", methods=["GET", "POST"])
def join_lobby():
    code = request.args.get("code") or request.form.get("code")
    if not code:
        room_name, error = create_lobby_or_error()
        if error:
            message, status = error
            return message, status
        code = room_name
    else:
        code = code.strip().upper()

    token, public, private, created_at = st.generate_session_token(
        session.get("user_id"),
        request.headers,
        request.remote_addr,
        code,
    )
    st.store_session_token(token, public, session.get("user_id"), code)
    response = make_response(redirect(url_for("lobby.lobby_room", code=code)))
    return _set_session_cookie(response, token)

"""
GET /game/<code>

📥 Receives:
- code (str): lobby room code

📤 Returns:
- has to return the html page of the game (game.html is juste ici pour la deco)

🎯 Purpose:
Renders the game page once the match has started.
"""
@lobby.route("/game/<code>", methods=["GET"])
def starting_game(code):
    return render_template("game.html", code=code)
"""
dans quelle situation on connect l'utilsateur au websocket et a quel moment on le deconnecte


"""