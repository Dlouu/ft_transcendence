from flask import render_template, Blueprint, request, redirect, url_for, g, session
import threading
from flask_socketio import join_room, emit, send, SocketIO
from functools import wraps


lobby = Blueprint("lobby", __name__)

# "*" only in production. Allows each to connect to the lobby no matter the origin. Has to be replaced by the actual domain main (localhost:5173)
socketio = SocketIO(cors_allowed_origins="*")

lobbies= {} # Dictionnary with: 4-characters room code -> {"players": int, "game_started": bool}
socketid_lobby = {}    # Dictionnary with: socket id -> room code
max_players  = 4       # Max players per lobby


@lobby.route("/pong", methods=["GET"])
def pong():
    return {"message": "pong"}, 200

# Debugging. Shows all lobbies with players count, state of the game. Shows all socket ids for each room
@lobby.route("/debuglobbies", methods=["GET"])
def get_lobbies():
    safe_lobbies = {}

    for code, data in lobbies.items():
        ready_set = data.get("ready", set())
        players_set = data.get("players_sids", set())

        safe_lobbies[code] = {
            "players_count": data.get("players", 0),
            "bots": data.get("bots", 0),
            "total": data.get("players", 0) + data.get("bots", 0),
            "game_started": data.get("game_started", False),
            "theme": data.get("theme", False),
            "supreme_master_user_id": data.get("supreme_master_user_id"),
            "supreme_master_sid": data.get("supreme_master_sid"),
            "players_sids_list": list(players_set),
            "ready_list": list(ready_set),
            "ready_count": len(ready_set)
        }

    return {
        "lobbies": safe_lobbies,
        "socketid_lobby": socketid_lobby,
        "total_lobbies": len(lobbies)
    }

def lobby_total_players(data):
    return data.get("players", 0) + data.get("bots", 0)

def lobby_bot_ids(data):
    return [f"BOT#{i+1}" for i in range(data.get("bots", 0))]

def emit_lobby_state(code):
    if code not in lobbies:
        return

    data = lobbies[code]

    payload = {
        "code": code,
        "humans": list(data["players_sids"]),
        "ready_humans": list(data["ready"]),
        "bots": lobby_bot_ids(data),

        "theme": data.get("theme", False),

        "humans_count": data.get("players", 0),
        "bots_count": data.get("bots", 0),
        "total_count": lobby_total_players(data),
        "max_players": max_players,

        "supreme_master_sid": data.get("supreme_master_sid"),
        "game_started": data.get("game_started", False),
        "supreme_master_starts": data.get("supreme_master_starts", False),
    }

    socketio.emit("lobby_state", payload, room=code)


# redirect to the game once everyone is ready to play
@lobby.route("/game/<code>", methods=["GET"])
def starting_game(code):
    return render_template("game2.html", code=code)


# Main route
@lobby.route("/")
def home():
    return render_template("home.html")


"""
Route for creating lobby. Checks in this order:
- If name is not empty, name contains only alnum characters, name is 4 charcaters long
- If room name is already taken
- If there are too many rooms already (1679616 = 36^4)

Add the lobby to the lobby dict with 0 players and game not started. Start a timer to remove the lobby after X seconds if no one joins. Redirect to the join lobby page if success
"""
@lobby.route("/create_lobby", methods=["POST"])
def create_lobby():
    room_name = request.form.get("room_name", "").strip().upper()
    user_id = session.get("user_id")

    if not room_name or not room_name.isalnum() or len(room_name) != 4:
        return "Room name must contain only alphanumeric characters and be exactly 4 characters long", 601
    if room_name in lobbies:
        return "Room already exists", 602
    if len(lobbies) >= 1679616:
        return "No more rooms available", 603

    lobbies[room_name] = {
        "players": 0,
        "bots": 0,
        "game_started": False,
        "ready": set(),
        "players_sids": set(),
        "theme": False,
        "supreme_master_user_id": user_id,
        "supreme_master_sid": None,
        "supreme_master_starts": False
    }

    lobby_removal(room_name, delay=200)
    return redirect(url_for("lobby.join_lobby", code=room_name))


# Join lobby with code
@lobby.route("/join_lobby", methods=["POST"])
def join_lobby_post():
    user_code = request.form.get("code", "").strip().upper()
    if user_code not in lobbies:
        return "Room doesn't exist"
    return redirect(url_for("lobby.join_lobby", code=user_code))


#join lobby after creating the lobby
@lobby.route("/join_lobby", methods=["GET"])
def join_lobby():
    code = request.args.get("code", "").strip().upper()
    if not code or code not in lobbies:
        return "Wrong room code"
    return render_template("game.html", code=code)


# SocketIO event for joining a lobby.
@socketio.on("join_lobby")
def join_lobby_socket(data):
    code = (data.get("code") or "").strip().upper()
    user_id = session.get("user_id")

    if code not in lobbies:
        emit("error", {"message": "Room doesn't exist"})
        return

    if lobbies[code]["game_started"]:
        emit("error", {"message": "Game already started"})
        return

    if request.sid in socketid_lobby:
        emit("error", {"message": "Already in a room"})
        return

    if len(lobbies[code]["players_sids"]) + lobbies[code]["bots"] >= max_players:
        emit("room_full")
        return

    join_room(code)

    socketid_lobby[request.sid] = code
    lobbies[code]["players_sids"].add(request.sid)
    lobbies[code]["players"] = len(lobbies[code]["players_sids"])

    creator_id = lobbies[code]["supreme_master_user_id"]
    if creator_id is not None and user_id == creator_id:
        lobbies[code]["supreme_master_sid"] = request.sid

    if lobbies[code]["supreme_master_sid"] is None:
        lobbies[code]["supreme_master_sid"] = request.sid

    emit_lobby_state(code)

# SocketIO event for disconnecting from a lobby. Decrease player count, remove socket id from socketid_lobby dict. If lobby is empty, start a timer to remove the lobby after X seconds
@socketio.on("disconnect")
def on_disconnect():
    sid = request.sid
    code = socketid_lobby.pop(sid, None)

    if not code or code not in lobbies:
        return

    data = lobbies[code]

    data["players"] = len(data["players_sids"])
    data["ready"].discard(sid)
    data["players_sids"].discard(sid)

    if data["supreme_master_sid"] == sid:
        remaining = list(data["players_sids"])
        data["supreme_master_sid"] = remaining[0] if remaining else None
        data["supreme_master_starts"] = False

    if data["players"] <= 0:
        lobbies.pop(code, None)
        return

    emit_lobby_state(code)


# Remove the lobby from the lobby dict. Emit a message to the lobby if the game hasn't started yet. Remove all socket ids associated with the lobby from the socketid_lobby dict
def remove_lobby(code):
    lobby_data = lobbies.get(code)
    if not lobby_data:
        return

    if lobby_data["game_started"] == False:
        socketio.emit("room_expired", {"message": "Lobby closed due to inactivity"}, room=code)

    lobbies.pop(code, None)

    for sid, lobby_code in list(socketid_lobby.items()):
        if lobby_code == code:
            socketid_lobby.pop(sid, None)


# Start a timer to remove the lobby after X seconds. If the lobby is already removed, do nothing
def lobby_removal(code, delay=200):
    timer = threading.Timer(delay, remove_lobby, args=[code])
    timer.daemon = True
    timer.start()

# set to true if player clicks on ready button
@socketio.on("player_ready")
def player_ready_to_play():
    sid = request.sid
    code = socketid_lobby.get(sid)

    if not code or code not in lobbies:
        return

    data = lobbies[code]

    if data["game_started"]:
        return

    if sid in data["ready"]:
        data["ready"].remove(sid)
    else:
        data["ready"].add(sid)

    emit_lobby_state(code)

# host can add bots
@socketio.on("add_bot")
def add_bot():
    sid = request.sid
    code = socketid_lobby.get(sid)

    if not code or code not in lobbies:
        return

    data = lobbies[code]

    if data["game_started"]:
        return

    if sid != data["supreme_master_sid"]:
        emit("error", {"message": "Only host can add bots"})
        return

    if data["players"] + data["bots"] >= max_players:
        emit("error", {"message": "Lobby is full"})
        return

    data["bots"] += 1
    emit_lobby_state(code)

# host can remove bots
@socketio.on("remove_bot")
def remove_bot():
    sid = request.sid
    code = socketid_lobby.get(sid)

    if not code or code not in lobbies:
        return

    data = lobbies[code]

    if data["game_started"]:
        return

    if sid != data["supreme_master_sid"]:
        emit("error", {"message": "Only host can delete bots"})
        return

    if data["bots"] <= 0:
        return

    data["bots"] -= 1
    emit_lobby_state(code)

# If all requirements are up, host can start the game
@socketio.on("master_start")
def master_start():
    sid = request.sid
    code = socketid_lobby.get(sid)

    if not code or code not in lobbies:
        return

    data = lobbies[code]

    if sid != data["supreme_master_sid"]:
        emit("error", {"message": "Only host can start"})
        return

    if len(data["players_sids"]) == 0:
        remove_lobby(code)
        return

    total_players = data["players"] + data["bots"]
    if total_players > max_players:
        emit("error", {"message": "Too many players"})
        return

    all_humans_ready = len(data["ready"]) == len(data["players_sids"])

    if all_humans_ready:
        data["game_started"] = True
        socketio.emit("game_start", {"code": code}, room=code)
    else:
        emit("error", {"message": "Not everyone is ready"})


# set the theme to whether Uwu or basic
@socketio.on("set_theme")
def set_theme(data):
    sid = request.sid
    code = socketid_lobby.get(sid)

    if not code or code not in lobbies:
        return

    lobby_data = lobbies[code]

    if lobby_data["game_started"]:
        return

    #supreme master cam only change host
    if sid != lobby_data["supreme_master_sid"]:
        emit("error", {"message": "Only host can change theme"})
        return

    theme = data.get("theme")
    if not isinstance(theme, bool):
        emit("error", {"message": "Invalid theme value"})
        return

    lobby_data["theme"] = theme
    emit_lobby_state(code)
