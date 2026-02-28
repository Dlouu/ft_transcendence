import os
import secrets

from flask import request, session
from flask_socketio import join_room, emit
from sqlalchemy.exc import IntegrityError

from app.core.extensions import socketio, db
from app.core.state import lobbies, socketid_lobby, max_players
from app.lobbies.services import emit_lobby_state, remove_lobby
from app.models.user import User
from app.services import session_service as st

def _ensure_socket_user(socket_id: str) -> User | None:
    if not socket_id:
        return None

    existing = User.query.filter_by(username=socket_id).first()
    if existing:
        existing.is_active = True
        db.session.commit()
        session["user_id"] = existing.id
        session["username"] = existing.username
        return existing

    default_picture = os.getenv("DEFAULT_PROFILE_PICTURE", "default_profile_picture.jpg")

    for _ in range(5):
        candidate_user_id = SOCKET_USER_ID_BASE + secrets.randbelow(SOCKET_USER_ID_RANGE)
        user = User(
            user_id=candidate_user_id,
            username=socket_id,
            profile_picture_url=default_picture,
            is_active=True
        )
        db.session.add(user)
        try:
            db.session.commit()
            session["user_id"] = user.id
            session["username"] = user.username
            return user
        except IntegrityError:
            db.session.rollback()
            continue
    return None


"""
SocketIO event: "connect"

📥 Receives:
- Automatic connection event

🎯 Purpose:
Store the socket id in users DB for testing.
"""
@socketio.on("connect")
def on_connect():
    raw_token = request.cookies.get("session_token")
    if not raw_token:
        return False
    token = raw_token.split(" ", 1)[1] if raw_token.startswith("Bearer ") else raw_token
    if not st.does_session_token_exist(token):
        return False
    try:
        payload = st.decode_session_token(token)
    except Exception as exc:
        print(f"Lobby: failed to decode token ({exc})", flush=True)
        return False
    if not payload:
        return False

    if payload.get("agent") and payload.get("agent") != request.headers.get("User-Agent", ""):
        return False
    if payload.get("remote_addr") and payload.get("remote_addr") != request.remote_addr:
        return False

    if payload.get("user_id") is not None:
        session["user_id"] = payload.get("user_id")
    if payload.get("room_code"):
        session["room_code"] = payload.get("room_code")

    try:
        _ensure_socket_user(request.sid)
    except Exception as exc:
        print(f"Lobby: failed to store socket user ({exc})", flush=True)

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
    if data["game_started"] or sid != data["supreme_master_sid"]:
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
    if data["game_started"] or sid != data["supreme_master_sid"]:
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
    if sid != data["supreme_master_sid"]:
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
        data["game_started"] = True
        socketio.emit("game_start", {"code": code}, room=code)
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
    if lobby_data["game_started"] or sid != lobby_data["supreme_master_sid"]:
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
    if lobby_data["game_started"] or sid != lobby_data["supreme_master_sid"]:
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
    if data["game_started"] or sid not in data["players"]:
        return

    data["players"][sid]["ready"] = not data["players"][sid]["ready"]
    emit_lobby_state(code)

"""
SocketIO event: "join_lobby"

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
@socketio.on("join_lobby")
def join_lobby_socket(data):
    code = (data.get("code") or "").strip().upper()
    if code not in lobbies:
        emit("error", {"message": "Room doesn't eexist"})
        return

    lobby_data = lobbies[code]

    if lobby_data["game_started"]:
        if request.sid in lobby_data["players"]:
            # Reconnexion autorisee
            lobby_data["players"][request.sid]["connected"] = True
            if lobby_data["players"][request.sid].get("user_id") is None:
                lobby_data["players"][request.sid]["user_id"] = session.get("user_id")
            join_room(code)
            socketid_lobby[request.sid] = code
            emit_lobby_state(code)
        else:
            emit("error", {"message": "Game already started"})
        return

    total_players = len(lobby_data["players"]) + lobby_data["bots"]
    if total_players >= max_players:
        emit("room_full", {"message": "Room is full"})
        return

    # Ajout du joueur
    join_room(code)
    socketid_lobby[request.sid] = code
    lobby_data["players"][request.sid] = {
        "ready": False,
        "connected": True,
        "user_id": session.get("user_id")
    }

    # Definir le host si inexistant
    if lobby_data["supreme_master_sid"] is None:
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
    if sid not in data["players"]:
        return

    if data["game_started"]:
        data["players"][sid]["connected"] = False
    else:
        del data["players"][sid]
        if data["supreme_master_sid"] == sid:
            data["supreme_master_sid"] = next(iter(data["players"]), None)

    if not data["players"] and not data["game_started"]:
        lobbies.pop(code, None)
        return

    emit_lobby_state(code)
