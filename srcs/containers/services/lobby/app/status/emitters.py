from app.core.extensions import socketio
from app.core.state import lobbies, max_players

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
    ready_sids = [sid for sid, p in data["players"].items() if p["ready"]]
    humans_ids = [data["players"][sid].get("user_id") for sid in humans_sids]

    payload = {
        "code": code,
        "bots_count": data.get("bots", 0),
        "humans_id": humans_ids, # user_id
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
