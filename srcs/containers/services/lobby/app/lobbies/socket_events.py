import os
import secrets
import requests
from flask import request, session, g
from flask_socketio import join_room, emit
from sqlalchemy.exc import IntegrityError

from app.core.extensions import socketio, db
from app.core.state import lobbies, socketid_lobby, max_players
from app.lobbies.lobby_generator import create_lobby_or_error
from app.lobbies.services import emit_lobby_state, remove_lobby
from app.models.user import User
from app.models.card_gallery import CardGallery
from app.tokens.check_token import check_token
from app.friends.socket_events import notify_friends_status, notify_players_ingame_status

GAME_CREATE_URL = os.getenv("GAME_SERVICE_URL") or os.getenv("GAME_CREATE_URL", "http://game:3000/game/create")
GAME_JOIN_URL = os.getenv("GAME_JOIN_URL", "http://game:3000/game/rejoin")

"""
SocketIO event: "connect"

📥 Receives:
- Automatic connection event

🎯 Purpose:
Verify if user can be associated with the socket connection.
"""
@socketio.on("connect")
@check_token()
def on_connect(*args, **kwargs):
    '''
    theo stocke un truc dans les cookies, je dois recuperer le token de session de lutilisateur est stocke dans les cooke.
    requete redis pour recuperer le cookie
    redis --> token de session (serveur)
    cookie --> token de session (client)
    cookie --> token de session --> user_id
    '''
    payload = getattr(g, "token_payload", None)
    user_id = payload.get("user_id") if isinstance(payload, dict) else session.get("user_id")
    if not user_id:
        return False

    session["user_id"] = user_id

    # Do not reject a valid token if DB lookup fails/unavailable.
    user = User.query.filter_by(user_id=user_id).first()
    if user:
        session["username"] = user.username
        session["db_user_id"] = user.id
        join_room(user.username)
        notify_friends_status(user.id, user.username, "online")

    for code, lobby_data in lobbies.items():
        if (
            lobby_data.get("game_started")
            and not lobby_data.get("game_ended")
            and user_id in lobby_data.get("players", {})
            and not lobby_data["players"][user_id].get("connected")
        ):
            emit("ongoing_game", {"code": code}, to=request.sid)
            break

def broadcast_public_lobbies():
    public = [
        {
            "code": lcode,
            "humans_count": len([p for p in ldata["players"].values() if p.get("connected")]),
            "total_count": len([p for p in ldata["players"].values() if p.get("connected")]) + ldata.get("bots", 0),
            "max_players": max_players,
        }
        for lcode, ldata in lobbies.items()
        if not ldata.get("privacy", True)
        and not ldata.get("game_started", False)
        and not ldata.get("game_ended", False)
        and (len([p for p in ldata["players"].values() if p.get("connected")]) + ldata.get("bots", 0)) < max_players
    ]
    socketio.emit("public_lobbies", {"lobbies": public}, room="lobby_browser")


@socketio.on("get_public_lobbies")
def get_public_lobbies():
    join_room("lobby_browser")
    broadcast_public_lobbies()


'''
create_lobby
le serveur genere toujours un code de room (pas de code fourni par le client)
renvoie un json ok/false
'''
@socketio.on("create_lobby")
def create_lobby(data):
    payload = data or {}
    requested_code = payload.get("code") or payload.get("room_name")
    if requested_code:
        return {"ok": False, "message": "Room code cannot be chosen", "status": 400}

    room_name, error = create_lobby_or_error(session.get("user_id"))
    if error:
        message, status = error
        return {"ok": False, "message": message, "status": status}
    return {"ok": True, "code": room_name}
    
@socketio.on("join_lobby_request")
def join_lobby_request(data):
    code = (data or {}).get("code", "").strip().upper()
    if not code:
        return {"ok": False, "message": "Missing room code", "status": 400}
    lobby_data = lobbies.get(code)
    if not lobby_data:
        return {"ok": False, "message": "Room doesn't exist", "status": 404} #404?
    return {"ok": True, "code": code}



"""
SocketIO event: "add_bot"

📥 Receives:
- No payload

📤 Emits:
- "lobby_state"
- "error" if unauthorized or lobby is full

🎯 Purpose:
Allows the host to add a bot to the lobby.
"""
@socketio.on("add_bot")
def add_bot():
    sid = request.sid
    code = socketid_lobby.get(sid)
    if not code or code not in lobbies:
        return
    data = lobbies[code]
    user_id = session.get("user_id")
    if not user_id:
        emit("error", {"message": "Not logged"})
        return

    if data["game_started"] or user_id != data["supreme_master_user_id"]:
        emit("error", {"message": "Only host can add bots"})
        return

    if len(data["players"]) + data["bots"] >= max_players:
        emit("error", {"message": "Lobby is full"})
        return

    data["bots"] += 1
    emit_lobby_state(code)


"""
SocketIO event: "remove_bot"

📥 Receives:
- No payload

📤 Emits:
- "lobby_state"
- "error" if unauthorized

🎯 Purpose:
Allows the host to remove a bot from the lobby.
"""
@socketio.on("remove_bot")
def remove_bot():
    sid = request.sid
    code = socketid_lobby.get(sid)
    if not code or code not in lobbies:
        return

    data = lobbies[code]
    user_id = session.get("user_id")
    if not user_id:
        emit("error", {"message": "Not logged"})
        return

    if data["game_started"] or user_id != data["supreme_master_user_id"]:
        emit("error", {"message": "Only host can remove bots"})
        return

    if data["bots"] > 0:
        data["bots"] -= 1
        emit_lobby_state(code)

"""
SocketIO event: "master_start"

📥 Receives:
- No payload

📤 Emits:
- "game_start" if all conditions are met
- "error" otherwise

🎯 Purpose:
Allows the host to start the game once:
- At least one player is present
- Player limit is respected
- All human players are ready
"""
@socketio.on("master_start")
def master_start():
    sid = request.sid
    code = socketid_lobby.get(sid)
    if not code or code not in lobbies:
        return

    data = lobbies[code]
    user_id = session.get("user_id")
    if not user_id:
        emit("error", {"message": "Not logged"})
        return

    if user_id != data["supreme_master_user_id"]:
        emit("error", {"message": "Only host can start"})
        return

    if len(data["players"]) == 0:
        remove_lobby(code)
        return

    if len(data["players"]) + data.get("bots", 0) > max_players:
        emit("error", {"message": "Too many players"})
        return

    if len(data["players"]) + data.get("bots", 0) < 2:
        emit("error", {"message": "You can't start the game alone. Add at least one bot or invite someone"})
        return
    
    if all(p["ready"] for p in data["players"].values()):
        ok, error_message = send_datas_on_game_created({
            **data,
            "code": code,
        })
        if not ok:
            emit("error", {"message": error_message})
            return
        data["game_started"] = True
        socketio.emit("game_start", {"code": code}, room=code)
        notify_players_ingame_status(data, True)
    else:
        emit("error", {"message": "Not everyone is ready"})



"""
SocketIO event: "set_theme"

📥 Receives:
- data:
    - theme (bool)

📤 Emits:
- "lobby_state"
- "error" if unauthorized or invalid value

🎯 Purpose:
Allows the host to change the lobby theme before the game starts.
"""
@socketio.on("set_theme")
def set_theme(data):
    sid = request.sid
    code = socketid_lobby.get(sid)
    if not code or code not in lobbies:
        return

    lobby_data = lobbies[code]
    user_id = session.get("user_id")
    if not user_id:
        emit("error", {"message": "Not logged"})
        return

    if lobby_data["game_started"] or user_id != lobby_data["supreme_master_user_id"]:
        emit("error", {"message": "Only host can change theme"})
        return

    theme = data.get("theme")
    if not isinstance(theme, bool):
        emit("error", {"message": "Invalid theme value"})
        return

    lobby_data["theme"] = theme
    emit_lobby_state(code)




@socketio.on("set_privacy")
def set_privacy(data):
    sid = request.sid
    code = socketid_lobby.get(sid)
    if not code or code not in lobbies:
        return

    lobby_data = lobbies[code]
    user_id = session.get("user_id")
    if not user_id:
        emit("error", {"message": "Not logged"})
        return

    if lobby_data["game_started"] or user_id != lobby_data["supreme_master_user_id"]:
        emit("error", {"message": "Only host can setup privacy lobby"})
        return

    privacy = data.get("privacy")
    if not isinstance(privacy, bool):
        emit("error", {"message": "Invalid privacy value"})
        return

    lobby_data["privacy"] = privacy
    emit_lobby_state(code)

"""
SocketIO event: "player_ready"

📥 Receives:
- No payload

📤 Emits:
- "lobby_state"

🎯 Purpose:
Toggles the ready state of a player and updates lobby synchronization.
"""
@socketio.on("player_ready")
def player_ready_to_play():
    sid = request.sid
    code = socketid_lobby.get(sid)
    if not code or code not in lobbies:
        return

    data = lobbies[code]
    user_id = session.get("user_id")
    if data["game_started"] or not user_id or user_id not in data["players"]:
        return

    data["players"][user_id]["ready"] = not data["players"][user_id]["ready"]
    emit_lobby_state(code)

"""
SocketIO event: "join_lobby_socket"

📥 Receives:
- data:
    - code (str)

📤 Emits:
- "error" if validation fails
- "room_full" if lobby is full
- "lobby_state" (via emit_lobby_state) on success

🎯 Purpose:
Adds a player to the lobby, updates internal structures,
and synchronizes all clients.
"""
@socketio.on("join_lobby_socket")
def join_lobby_socket(data):
    code = ((data or {}).get("code") or "").strip().upper()
    if code not in lobbies:
        emit("error", {"message": "Room doesn't eexist"})
        return

    lobby_data = lobbies[code]
    user_id = session.get("user_id")
    if not user_id:
        emit("error", {"message": "Not logged"})
        return

    def _bind_player_sid():
        player = lobby_data["players"][user_id]
        old_sid = player.get("sid")
        if old_sid and old_sid != request.sid:
            socketid_lobby.pop(old_sid, None)
        player["sid"] = request.sid
        player["connected"] = True
        socketid_lobby[request.sid] = code

    if lobby_data["game_started"]:
        if user_id in lobby_data["players"]:
            # Reconnexion autorisee
            join_room(code)
            _bind_player_sid()
            if lobby_data.get("supreme_master_user_id") == user_id:
                lobby_data["supreme_master_sid"] = request.sid
            ok, error_message = send_datas_on_game_joined({
                "player_id": user_id,
                "theme": lobby_data.get("theme"),
            })
            if not ok:
                emit("error", {"message": error_message})
                return
            emit_lobby_state(code)
        else:
            emit("error", {"message": "Game already started"})
        return

    if user_id not in lobby_data["players"]:
        total_players = len(lobby_data["players"]) + lobby_data["bots"]
        if total_players >= max_players:
            emit("room_full", {"message": "Room is full"})
            return

        lobby_data["players"][user_id] = {
            "ready": False,
            "connected": True,
            "sid": request.sid,
        }
    else:
        lobby_data["players"][user_id]["connected"] = True
        _bind_player_sid()

    # Ajout du joueur
    join_room(code)
    socketid_lobby[request.sid] = code

    # Definir le host si inexistant
    if lobby_data["supreme_master_user_id"] is None:
        lobby_data["supreme_master_user_id"] = user_id
    if lobby_data["supreme_master_user_id"] == user_id:
        lobby_data["supreme_master_sid"] = request.sid

    emit_lobby_state(code)

"""
SocketIO event: "disconnect"

📥 Receives:
- Automatic disconnection event

📤 Emits:
- "lobby_state" if lobby still has players
- Deletes lobby if empty

🎯 Purpose:
Removes the player from the lobby.
Transfers host role if necessary.
Deletes the lobby if no players remain.
"""
@socketio.on("disconnect")
def on_disconnect():
    sid = request.sid
    code = socketid_lobby.pop(sid, None)
    if not code or code not in lobbies:
        return

    data = lobbies[code]
    user_id = None
    for candidate_user_id, player in data["players"].items():
        if player.get("sid") == sid:
            user_id = candidate_user_id
            break
    if user_id is None:
        return

    if data["game_started"]:
        data["players"][user_id]["connected"] = False
    else:
        del data["players"][user_id]
        if data["supreme_master_user_id"] == user_id:
            data["supreme_master_user_id"] = next(iter(data["players"]), None)

    supreme_master_user_id = data.get("supreme_master_user_id")
    if supreme_master_user_id and supreme_master_user_id in data["players"]:
        host_player = data["players"][supreme_master_user_id]
        data["supreme_master_sid"] = host_player.get("sid") if host_player.get("connected") else None
    else:
        data["supreme_master_sid"] = None

    user_id_db = session.get("db_user_id")
    username = session.get("username")
    if user_id_db and username:
        notify_friends_status(user_id_db, username, "offline")

    if not data["players"] and not data["game_started"]:
        lobbies.pop(code, None)
        broadcast_public_lobbies()
        return

    emit_lobby_state(code)

@socketio.on("leave_lobby")
def leave_lobby():
    sid = request.sid
    code = socketid_lobby.pop(sid, None)
    if not code or code not in lobbies:
        return

    data = lobbies[code]
    user_id = None
    for candidate_user_id, player in data["players"].items():
        if player.get("sid") == sid:
            user_id = candidate_user_id
            break

    if user_id is None:
        return

    del data["players"][user_id]

    if data["supreme_master_user_id"] == user_id:
        data["supreme_master_user_id"] = next(iter(data["players"]), None)

    supreme_master_user_id = data.get("supreme_master_user_id")
    if supreme_master_user_id and supreme_master_user_id in data["players"]:
        host_player = data["players"][supreme_master_user_id]
        data["supreme_master_sid"] = host_player.get("sid") if host_player.get("connected") else None
    else:
        data["supreme_master_sid"] = None

    if not data["players"] and not data["game_started"]:
        lobbies.pop(code, None)
        return

    emit_lobby_state(code)

def get_users_by_player_ids(player_ids):
    users = (
        User.query.filter(User.user_id.in_(player_ids)).all()
        if player_ids
        else []
    )
    return {str(user.user_id): user for user in users}


def build_player_entry(player_id, users_by_user_id, default_card_back, profile_picture):
    player_key = str(player_id)
    user = users_by_user_id.get(player_key)
    card_back_url = default_card_back
    s3_bucket = os.getenv("S3_BUCKET_NAME")

    if user:
        profile_picture = f"https://{s3_bucket}.s3.amazonaws.com/{user.profile_picture_url}"
        if user.card_back_id:
            card_gallery_entry = CardGallery.query.filter_by(id=user.card_back_id).first()
            if card_gallery_entry:
                card_back_url = f"https://{s3_bucket}.s3.amazonaws.com/{card_gallery_entry.img_url}"

    return {
        "id": player_key,
        "name": user.username if user else player_key,
        "cardBackUrl": card_back_url,
        "profilePicture": profile_picture,
    }


def send_datas_on_game_created(data):
    player_ids = list((data.get("players") or {}).keys())
    users_by_user_id = get_users_by_player_ids(player_ids)
    default_card_back = "uwu" if data.get("theme") else "basic" #change here
    profile_picture = "default"

    payload = {
        "roomName": data.get("code"),
        "players": [
            build_player_entry(player_id, users_by_user_id, default_card_back, profile_picture)
            for player_id in player_ids
        ],
        "botNbr": data.get("bots", 0),
        "theme": "UWU" if data.get("theme") else "BASE",
    }
    try:
        response = requests.post(GAME_CREATE_URL, json=payload, timeout=5)
        response.raise_for_status()
    except requests.RequestException as exc:
        return False, f"Unable to create game: {exc}"
    return True, payload


def send_datas_on_game_joined(data):
    player_id = data.get("player_id")
    if player_id is None:
        return False, "Missing player id"

    default_card_back = "uwu" if data.get("theme") else "basic"
    users_by_user_id = get_users_by_player_ids([player_id])
    profile_picture = "default"
    payload = {
        "player": [
            build_player_entry(player_id, users_by_user_id, default_card_back, profile_picture)
        ]
    }
    try:
        response = requests.post(GAME_JOIN_URL, json=payload, timeout=5)
        response.raise_for_status()
    except requests.RequestException as exc:
        return False, f"Unable to join game: {exc}"
    return True, payload
