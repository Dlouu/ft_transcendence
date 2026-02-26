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

    payload = {
        "code": code,
        "humans": humans_sids,
        "ready_humans": ready_sids,
        "bots": [f"BOT#{i+1}" for i in range(data.get("bots", 0))],
        "theme": data.get("theme", False),
        "privacy": data.get("privacy", True),
        "humans_count": len(humans_sids),
        "bots_count": data.get("bots", 0),
        "total_count": len(humans_sids) + data.get("bots", 0),
        "max_players": max_players,
        "supreme_master_sid": data.get("supreme_master_sid"),
        "game_started": data.get("game_started", False),
        "supreme_master_starts": data.get("supreme_master_starts", False)
    }

    socketio.emit("lobby_state", payload, room=code)
