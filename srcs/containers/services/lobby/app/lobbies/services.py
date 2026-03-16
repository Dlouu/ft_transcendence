import threading

from app.core.state import lobbies, socketid_lobby, max_players
from app.core.extensions import socketio

"""
Emits the current lobby state via SocketIO

📥 Receives:
- code (str): lobby room code

📤 Emits (SocketIO event: "lobby_state"):
- code
- list of human players (socket IDs)
- list of ready players
- list of bots
- theme status
- humans count
- bots count
- total count
- max players allowed
- host socket ID (supreme_master_sid)
- game_started flag
- supreme_master_starts flag

🎯 Purpose:
Synchronizes all connected clients in the lobby with the latest state.
"""
def emit_lobby_state(code):
    if code not in lobbies:
        return
    data = lobbies[code]

    humans_sids = [sid for sid, p in data["players"].items() if p["connected"]]
    humans_ids = [data["players"][sid].get("user_id") for sid in humans_sids]
    ready_sids = [sid for sid, p in data["players"].items() if p["ready"]]

    payload = {
        "code": code, # what Yohann needs
        "bots_count": data.get("bots", 0), # what Yohann needs
        "humans_id": humans_ids, # user_id # what Yohann needs
        #"humans_username": humans_username,
        "theme": data.get("theme", False), # what Yohann needs
        "game_ended": data.get("game_ended", False),
        "humans_sid": humans_sids, # socketid
        "ready_humans": ready_sids,
        "bots": [f"BOT#{i+1}" for i in range(data.get("bots", 0))],
        "privacy": data.get("privacy", True),
        "humans_count": len(humans_sids),
        "total_count": len(humans_sids) + data.get("bots", 0),
        "max_players": max_players,
        "supreme_master_sid": data.get("supreme_master_sid"),
        "game_started": data.get("game_started", False),
        "supreme_master_starts": data.get("supreme_master_starts", False)
    }

    socketio.emit("lobby_state", payload, room=code)

"""
Internal function

📥 Receives:
- code (str): lobby room code

📤 Emits:
- "room_expired" if the game has not started

🎯 Purpose:
Permanently deletes a lobby and cleans all related socket mappings.
"""
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


"""
Internal function (timer)

📥 Receives:
- code (str)
- delay (int, seconds)

📤 Returns:
- None

🎯 Purpose:
Schedules automatic lobby removal after a period of inactivity.
"""
def lobby_removal(code, delay=600):
    timer = threading.Timer(delay, remove_lobby, args=[code])
    timer.daemon = True
    timer.start()
