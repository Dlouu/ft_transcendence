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
        ready_set = data.get("ready", set())
        players_set = data.get("players_sids", set())

        safe_lobbies[code] = {
            "players_count": data.get("players", 0),
            "bots": data.get("bots", 0),
            "total": len(data.get("players", {})) + data.get("bots", 0),
            "game_started": data.get("game_started", False),
            "theme": data.get("theme", False),
            "supreme_master_user_id": data.get("supreme_master_user_id"),
            "supreme_master_sid": data.get("supreme_master_sid"),
            "players_sids_list": list(players_set),
            "ready_list": list(ready_set),
            "ready_count": len(ready_set),
            "privacy": data.get("privacy", True)
        }

    return {
        "lobbies": safe_lobbies,
        "socketid_lobby": socketid_lobby,
        "total_lobbies": len(lobbies)
    }
