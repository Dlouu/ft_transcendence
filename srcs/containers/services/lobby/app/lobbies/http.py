from flask import Blueprint, request, redirect, url_for, session

from app.core.state import lobbies, max_players, three_letters, four_letters
from app.lobbies.services import lobby_removal
import random

lobby = Blueprint("lobby_http", __name__)

"""
POST /create_lobby

📥 Receives:
- room_name (form data)
- user_id (session)

📤 Returns:
- Redirect to /join_lobby if successful
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
    random_value = random.randint(0,2)
    if random_value == 0:
        room_name = str(random.randint(1,9)) + random.choice(three_letters)
    elif random_value == 1:
        room_name = random.choice(three_letters) + str(random.randint(1,9))
    else:
        room_name = random.choice(four_letters)
    room_name = room_name.upper()
    user_id = session.get("user_id")
    socket_id = session.get
    if room_name in lobbies:
        return "Room already exists", 602
    if len(lobbies) >= 1679616:
        return "No more rooms available", 603

    lobbies[room_name] = {
        "players": {}, # --> {sid, ready, connected}
        "bots": 0,
        "game_started": False,
        "game_ended": False,
        "theme": False,
        "supreme_master_user_id": user_id,
        "supreme_master_sid": None,
        "supreme_master_starts": False,
        "privacy": True
    }

    lobby_removal(room_name, delay=600)
    return redirect(url_for("lobby.join_lobby", code=room_name))
