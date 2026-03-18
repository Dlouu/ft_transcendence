from flask import Blueprint

from app.core.state import lobbies, socketid_lobby

lobby = Blueprint("lobby_debug", __name__)

"""
GET /debuglobbies

📥 Receives:
- HTTP GET request
- No parameters required

📤 Returns:
- JSON object containing:
    - All active lobbies with their internal state
    - socket_id -> lobby mapping
    - Total number of active lobbies

🎯 Purpose:
Debug endpoint used to inspect the internal server state.
"""
@lobby.route("/debuglobbies", methods=["GET"])
def get_lobbies():
    safe_lobbies = {}

    for code, data in lobbies.items():
        players = data.get("players", {})
        connected_players = {user_id: p for user_id, p in players.items() if p.get("connected")}
        ready_user_ids = [user_id for user_id, p in players.items() if p.get("ready")]
        supreme_master_user_id = data.get("supreme_master_user_id")
        supreme_master_sid = None
        if supreme_master_user_id in players:
            host_player = players[supreme_master_user_id]
            if host_player.get("connected"):
                supreme_master_sid = host_player.get("sid")

        safe_lobbies[code] = {
            "players_count": len(players),
            "connected_players_count": len(connected_players),
            "bots": data.get("bots", 0),
            "total": len(connected_players) + data.get("bots", 0),
            "game_started": data.get("game_started", False),
            "theme": data.get("theme", False),
            "supreme_master_user_id": supreme_master_user_id,
            "supreme_master_sid": supreme_master_sid,
            "players_user_ids": list(players.keys()),
            "connected_user_ids": list(connected_players.keys()),
            "players_sids_list": [p.get("sid") for p in connected_players.values()],
            "ready_user_ids": ready_user_ids,
            "ready_count": len(ready_user_ids),
            "privacy": data.get("privacy", True)
        }

    return {
        "lobbies": safe_lobbies,
        "socketid_lobby": socketid_lobby,
        "total_lobbies": len(lobbies)
    }
