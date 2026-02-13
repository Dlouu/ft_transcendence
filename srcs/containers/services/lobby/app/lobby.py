from flask import render_template, Blueprint, request, redirect, url_for, g
import threading
from flask_socketio import join_room, emit, SocketIO
from functools import wraps


lobby = Blueprint("lobby", __name__)

# "*" only in production. Allows each to connect to the lobby no matter the origin. Has to be replaced by the actual domain main (localhost:5173)
socketio = SocketIO(cors_allowed_origins="*")

lobbies= {} # Dictionnary with: 4-characters room code -> {"players": int, "game_started": bool}      
socketid_lobby = {}    # Dictionnary with: socket id -> room code
max_players  = 4       # Max players per lobby

# Debugging. Shows all lobbies with players count, state of the game. Shows all socket ids for each room
@lobby.route("/debuglobbies", methods=["GET"])
def get_lobbies():
    safe_lobbies = {}

    for code, data in lobbies.items():
        ready_set = data.get("ready", set())
        players_set = data.get("players_sids", set())

        safe_lobbies[code] = {
            "players_count": data.get("players", 0),
            "game_started": data.get("game_started", False),

            
            "ready_list": list(ready_set),
            "players_sids_list": list(players_set),

            
            "ready_count": len(ready_set)
        }

    return {
        "lobbies": safe_lobbies,
        "socketid_lobby": socketid_lobby,
        "total_lobbies": len(lobbies)
    }


@lobby.route("/game/<code>", methods=["GET"])
def starting_game(code):
    return render_template("game2.html")


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
# @login_jwt_required() #need to implement a function to check the jwt and get the user info from it.
def create_lobby():
    room_name = request.form.get("room_name", "").strip().upper()

    if not room_name or not room_name.isalnum() or len(room_name) != 4:
        return "Room name must contain only alphanumeric characters and be exactly 4 characters long", 601
    if room_name in lobbies:
        return "Room already exists", 602
    if len(lobbies) >= 1679616:
        return "No more rooms available", 603

    lobbies[room_name] = {"players": 0, "game_started": False, "ready": set(), "players_sids": set(), "theme": False}
    lobby_removal(room_name, delay=200)

    return redirect(url_for("lobby.join_lobby", code=room_name))

# Join lobby with code
@lobby.route("/join_lobby", methods=["POST"])
# @login_jwt_required() #need to implement a function to check the jwt and get the user info from it.
def join_lobby_post():
    user_code = request.form.get("code", "").strip().upper()
    if user_code not in lobbies:
        return "Room doesn't exist"
    return redirect(url_for("lobby.join_lobby", code=user_code))

#join lobby after creating the lobby
@lobby.route("/join_lobby", methods=["GET"])
# @login_jwt_required() #need to implement a function to check the jwt and get the user info from it.
def join_lobby():
    code = request.args.get("code", "").strip().upper()
    if not code or code not in lobbies:
        return "Wrong room code"
    return render_template("game.html", code=code)

# SocketIO event for joining a lobby.
@socketio.on("join_lobby")
def join_lobby_socket(data):
    code = (data.get("code") or "").strip().upper()

    if code not in lobbies:
        emit("error", {"message": "Room doesn't exist"})
        return

    if request.sid in socketid_lobby:
        emit("error", {"message": "Already in a room"})
        return
    if lobbies[code]["game_started"]:
        emit("error", {"message": "Game already started"})
        return

    if lobbies[code]["players"] >= max_players:
        emit("room_full")
        return

    join_room(code)

    socketid_lobby[request.sid] = code
    lobbies[code]["players"] += 1
    lobbies[code]["players_sids"].add(request.sid)

    emit("count_update", {"count": lobbies[code]["players"]}, room=code)

    emit("player_list", {
        "players": list(lobbies[code]["players_sids"]),
        "ready": list(lobbies[code]["ready"])
    }, room=code)


# SocketIO event for disconnecting from a lobby. Decrease player count, remove socket id from socketid_lobby dict. If lobby is empty, start a timer to remove the lobby after X seconds
@socketio.on("disconnect")
def on_disconnect():
    sid = request.sid
    code = socketid_lobby.pop(sid, None)
    if not code:
        return
    if code not in lobbies:
        return

    lobbies[code]["players"] -= 1
    lobbies[code]["ready"].discard(sid)
    lobbies[code]["players_sids"].discard(sid)
    emit("count_update", {"count": lobbies[code]["players"]}, room=code)

    emit("player_list", {"players": list(lobbies[code]["players_sids"]),"ready": list(lobbies[code]["ready"])}, room=code)
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

@socketio.on("player_ready")
def player_ready_to_play():
    sid = request.sid
    code = socketid_lobby.get(sid)

    if not code or code not in lobbies:
        return

    lobby_data = lobbies[code]

    if lobby_data["game_started"]:
        return

    
    if sid in lobby_data["ready"]:
        lobby_data["ready"].remove(sid)
    else:
        lobby_data["ready"].add(sid)

    
    emit("player_list", {
        "players": list(lobby_data["players_sids"]),
        "ready": list(lobby_data["ready"])
    }, room=code)

    if lobby_data["players"] == 4 and len(lobby_data["ready"]) == 4:
        lobby_data["game_started"] = True
        socketio.emit("game_start", room=code)


"""
First dans la room = maitre supreme
theme uwu = true basic = false
bot +1 -1
start game =  # tout le monde ready + hote appuie sur start
"""