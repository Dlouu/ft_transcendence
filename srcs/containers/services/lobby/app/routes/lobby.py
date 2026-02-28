from flask import Blueprint, render_template, request, redirect, url_for, session
from app.core.state import lobbies, three_letters, four_letters
from app.lobbies.services import lobby_removal
import random
import string

lobby = Blueprint("lobby", __name__)

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
    for _ in range(100):
        print("lennnnnn", len(lobbies), flush=True)
        if len(lobbies) < 1015:
            room_name = generate_room_code_first_edition()
        else:
            room_name = generate_room_code_second_edition()

        if room_name not in lobbies:
            return room_name, None
    return None, ("Failed to generate unique room", 602)

def create_lobby_or_error():
    if len(lobbies) > 1679616:
        return None, ("No more rooms available", 603)
    
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
    room_name, error = create_lobby_or_error()
    if error:
        message, status = error
        return message, status
    return redirect(url_for("lobby.lobby_room", code=room_name))

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
        room_name, error = _create_lobby_or_error()
        if error:
            return error
        code = room_name
    else:
        code = code.strip().upper()

    return redirect(url_for("lobby.lobby_room", code=code))

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
