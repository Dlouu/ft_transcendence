from app.core.extensions import socketio
from app.core.state import lobbies, max_players
from app.models.user import User

"""
Emits the current lobby state via SocketIO

📥 Receives:
- code (str): lobby room code

📤 Emits (SocketIO event: "lobby_state"):
- code
- list of human players (user IDs)
- list of ready players (user IDs)
- list of bots
- theme status
- humans count
- bots count
- total count
- max players allowed
- host user ID (supreme_master_user_id)
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

    players = data["players"]
    connected_players = [(user_id, p) for user_id, p in players.items() if p.get("connected")]
    humans_usernames = {
        user_id: User.query.get(user_id).username 
        for user_id, _ in connected_players
    }
    humans_ids = [user_id for user_id, _ in connected_players]
    humans_sids = [p.get("sid") for _, p in connected_players]
    ready_ids = [user_id for user_id, p in players.items() if p.get("ready")]
    ready_sids = [players[user_id].get("sid") for user_id in ready_ids if players[user_id].get("sid")]
    supreme_master_user_id = data.get("supreme_master_user_id")
    supreme_master_sid = None
    if supreme_master_user_id in players:
        host_player = players[supreme_master_user_id]
        if host_player.get("connected"):
            supreme_master_sid = host_player.get("sid")

    payload = {
        "code": code,
        "bots_count": data.get("bots", 0),
        "humans_id": humans_ids, # user_id
        "humans_username": humans_username,
        "theme": data.get("theme", False), # what Yohann needs
        "game_ended": data.get("game_ended", False),
        "humans_sid": humans_sids, # socketid (debug/compat)
        "ready_humans": ready_sids, # socketid (compat)
        "ready_humans_id": ready_ids, # user_id
        "bots": [f"BOT#{i+1}" for i in range(data.get("bots", 0))],
        "privacy": data.get("privacy", True),
        "humans_count": len(humans_ids),
        "total_count": len(humans_ids) + data.get("bots", 0),
        "max_players": max_players,
        "supreme_master_user_id": supreme_master_user_id,
        "supreme_master_sid": supreme_master_sid,
        "game_started": data.get("game_started", False),
        "supreme_master_starts": data.get("supreme_master_starts", False)
    }

    socketio.emit("lobby_state", payload, room=code)
