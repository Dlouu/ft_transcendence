from flask import Blueprint, request, jsonify

from app.core.extensions import socketio
from app.core.state import lobbies, socketid_lobby
from app.lobbies.services import remove_lobby
from app.friends.socket_events import notify_players_ingame_status

game = Blueprint("game", __name__)

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
