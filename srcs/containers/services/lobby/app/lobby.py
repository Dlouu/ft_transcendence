from flask import render_template, Blueprint, request, redirect, url_for, g
import threading
from flask_socketio import join_room, emit, SocketIO
from functools import wraps


lobby = Blueprint("lobby", __name__)

socketio = SocketIO(cors_allowed_origins="*")

lobbies = {}           # 4-characters room code -> {"players": int, "game_started": bool}
socketid_lobby = {}    # sid -> code
max_players  = 4

# Debugging
@lobby.route("/debuglobbies", methods=["GET"])
def get_lobbies():
    return {"lobbies": lobbies, "socketid_lobby": socketid_lobby}

@lobby.route("/")
def home():
    return render_template("home.html")

@lobby.route("/create_lobby", methods=["POST"])
def create_lobby():
    room_name = request.form.get("room_name", "").strip().upper()

    if not room_name:
        return "Room name is required", 601
    if room_name in lobbies:
        return "Room already exists", 602
    if len(lobbies) >= 1679616:
        return "No more rooms available", 603

    lobbies[room_name] = {"players": 0, "game_started": False}
    lobby_removal(room_name, delay=10)

    return redirect(url_for("lobby.join_lobby", code=room_name))


@lobby.route("/join_lobby", methods=["POST"])
def join_lobby_post():
    user_code = request.form.get("code", "").strip().upper()
    if user_code not in lobbies:
        return "Room doesn't exist"
    return redirect(url_for("lobby.join_lobby", code=user_code))


@lobby.route("/join_lobby", methods=["GET"])
def join_lobby():
    code = request.args.get("code", "").strip().upper()
    if not code or code not in lobbies:
        return "Wrong room code"
    return render_template("game.html", code=code)


@socketio.on("join_lobby")
def join_lobby_socket(data):
    code = (data.get("code") or "").strip().upper()
    if code not in lobbies:
        emit("error", {"message": "Room doesn't exist"})
        return

    if request.sid in socketid_lobby: #good to know
        emit("error", {"message": "Already in a room"})
        return

    if lobbies[code]["players"] >= max_players:
        emit("room_full", {"message": "Room is full"})
        return
    
    join_room(code)
    socketid_lobby[request.sid] = code

    lobbies[code]["players"] += 1

    emit("count_update", {"count": lobbies[code]["players"]}, room=code)


@socketio.on("disconnect")
def on_disconnect():
    sid = request.sid
    code = socketid_lobby.pop(sid, None)
    if not code:
        return
    if code not in lobbies:
        return

    lobbies[code]["players"] -= 1
    emit("count_update", {"count": lobbies[code]["players"]}, room=code)


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


def lobby_removal(code, delay=10):
    timer = threading.Timer(delay, remove_lobby, args=[code])
    timer.daemon = True
    timer.start()
