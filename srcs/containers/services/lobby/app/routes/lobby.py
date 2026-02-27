from flask import Blueprint, render_template, request, redirect, url_for, session
from app.core.state import lobbies, three_letters, four_letters
from app.lobbies.services import lobby_removal
import random

lobby = Blueprint("lobby", __name__)

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
POST /create_lobby

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
@lobby.route("/create_lobby", methods=["POST"])
def join_lobby():
    code = request.args.get("code") or request.form.get("code")
    if not code:
        # Create a lobby when no code is provided
        random_value = random.randint(0, 2)
        if random_value == 0:
            room_name = str(random.randint(1, 9)) + random.choice(three_letters)
        elif random_value == 1:
            room_name = random.choice(three_letters) + str(random.randint(1, 9))
        else:
            room_name = random.choice(four_letters)
        room_name = room_name.upper()

        if room_name in lobbies:
            return "Room already exists", 602
        if len(lobbies) >= 1679616:
            return "No more rooms available", 603

        lobbies[room_name] = {
            "players": {},  # {sid: {ready, connected, user_id}}
            "bots": 0,
            "game_started": False,
            "game_ended": False,
            "theme": False,
            "supreme_master_user_id": session.get("user_id"),
            "supreme_master_sid": None,
            "supreme_master_starts": False,
            "privacy": True
        }

        lobby_removal(room_name, delay=600)
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
