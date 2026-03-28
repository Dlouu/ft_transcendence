from flask import Blueprint, request, jsonify

from app.core.extensions import socketio
from app.core.state import lobbies, socketid_lobby, max_players
from app.lobbies.services import remove_lobby
from app.friends.socket_events import notify_players_ingame_status

game = Blueprint("game", __name__)


@game.route("/debuglobbies", methods=["GET"])
def debug_lobbies():
    result = {}
    for code, data in lobbies.items():
        players = data.get("players", {})
        connected = [uid for uid, p in players.items() if p.get("connected")]
        result[code] = {
            "players": {uid: {"ready": p.get("ready"), "connected": p.get("connected"), "sid": p.get("sid")} for uid, p in players.items()},
            "bots": data.get("bots", 0),
            "total_count": len(connected) + data.get("bots", 0),
            "max_players": max_players,
            "game_started": data.get("game_started", False),
            "game_ended": data.get("game_ended", False),
            "privacy": data.get("privacy", True),
            "theme": data.get("theme", False),
            "supreme_master_user_id": data.get("supreme_master_user_id"),
            "supreme_master_sid": data.get("supreme_master_sid"),
        }
    return jsonify({"lobbies_count": len(result), "lobbies": result}), 200

@game.route("/game/delete", methods=["POST"])
def delete_game():
    data = request.get_json(silent=True) or {}
    code = (data.get("roomName") or "").strip().upper()

    if not code:
        return jsonify({"ok": False, "message": "Missing roomName"}), 400

    if code not in lobbies:
        return jsonify({"ok": False, "message": "Lobby not found"}), 404

    lobbies[code]["game_ended"] = True
    notify_players_ingame_status(lobbies[code], False)
    socketio.emit("game_ended", {"code": code}, room=code)
    remove_lobby(code)

    return jsonify({"ok": True}), 200
