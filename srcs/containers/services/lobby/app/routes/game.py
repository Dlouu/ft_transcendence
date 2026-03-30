from flask import Blueprint, request, jsonify

from app.core.extensions import socketio
from app.core.state import lobbies, players_in_game, players_left_game
from app.lobbies.services import remove_lobby, emit_lobby_state
from app.friends.socket_events import notify_players_ingame_status

game = Blueprint("game", __name__)



@game.route("/lobby/delete", methods=["POST"])
def delete_game():
    data = request.get_json(silent=True) or {}
    code = (data or "").strip().upper()

    if not code:
        return jsonify({"ok": False, "message": "Missing roomName"}), 400

    if code not in lobbies:
        return jsonify({"ok": False, "message": "Lobby not found"}), 404

    lobbies[code]["game_ended"] = True
    lobbies[code]["game_started"] = False
    emit_lobby_state(code)
    notify_players_ingame_status(lobbies[code], False)
    socketio.emit("game_ended", {"code": code}, room=code)
    for uid in lobbies[code].get("players", {}):
        players_in_game.discard(uid)
    for uid in [u for u, c in players_left_game.items() if c == code]:
        players_left_game.pop(uid, None)
    remove_lobby(code)

    return jsonify({"ok": True}), 200
