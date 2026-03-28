import os
import threading

import requests

from app.core.state import lobbies, socketid_lobby, max_players
from app.core.extensions import socketio
from app.models.user import User
from app.models.card_gallery import CardGallery

GAME_CREATE_URL = os.getenv("GAME_SERVICE_URL") or os.getenv("GAME_CREATE_URL", "http://game:3000/game/create")
GAME_JOIN_URL = os.getenv("GAME_JOIN_URL", "http://game:3000/game/rejoin")

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
        "humans_id": humans_ids,
        "humans_usernames": humans_usernames,
        "theme": data.get("theme", False),
        "game_ended": data.get("game_ended", False),
        "humans_sid": humans_sids,
        "ready_humans": ready_sids,
        "ready_humans_id": ready_ids,
        "bots": [f"BOT#{i+1}" for i in range(data.get("bots", 0))],
        "privacy": data.get("privacy", True),
        "humans_count": len(humans_ids),
        "total_count": len(humans_ids) + data.get("bots", 0),
        "max_players": max_players,
        "supreme_master_user_id": supreme_master_user_id,
        "supreme_master_sid": supreme_master_sid,
        "game_started": data.get("game_started", False),
        "supreme_master_starts": data.get("supreme_master_starts", False),
        "all_lobbies": [
            {
                "code": lcode,
                "humans_count": len([p for p in ldata["players"].values() if p.get("connected")]),
                "bots_count": ldata.get("bots", 0),
                "total_count": len([p for p in ldata["players"].values() if p.get("connected")]) + ldata.get("bots", 0),
                "privacy": ldata.get("privacy", True),
                "game_started": ldata.get("game_started", False),
            }
            for lcode, ldata in lobbies.items()
        ],
        "available_lobbies": [
            {
                "code": lcode,
                "total_count": len([p for p in ldata["players"].values() if p.get("connected")]) + ldata.get("bots", 0),
            }
            for lcode, ldata in lobbies.items()
            if not ldata.get("privacy", True)
            and not ldata.get("game_started", False)
            and not ldata.get("game_ended", False)
            and (len([p for p in ldata["players"].values() if p.get("connected")]) + ldata.get("bots", 0)) < max_players
        ]
    }
    socketio.emit("lobby_state", payload, room=code)

    public = build_public_lobbies_list()
    socketio.emit("public_lobbies", {"lobbies": public}, room="lobby_browser")


def broadcast_public_lobbies():
    public = build_public_lobbies_list()
    socketio.emit("public_lobbies", {"lobbies": public}, room="lobby_browser")


def build_public_lobbies_list():
    return [
        {
            "code": lcode,
            "humans_count": len([p for p in ldata["players"].values() if p.get("connected")]),
            "total_count": len([p for p in ldata["players"].values() if p.get("connected")]) + ldata.get("bots", 0),
            "max_players": max_players,
        }
        for lcode, ldata in lobbies.items()
        if not ldata.get("privacy", True)
        and not ldata.get("game_started", False)
        and not ldata.get("game_ended", False)
        and (len([p for p in ldata["players"].values() if p.get("connected")]) + ldata.get("bots", 0)) < max_players
    ]


def remove_lobby(code):
    lobby_data = lobbies.get(code)
    if not lobby_data:
        return

    if lobby_data["game_started"] == False:
        socketio.emit("room_expired", {"message": "Lobby closed due to inactivity"}, room=code)

    lobbies.pop(code, None)
    socketio.emit("public_lobbies", {"lobbies": build_public_lobbies_list()}, room="lobby_browser")

    for sid, lobby_code in list(socketid_lobby.items()):
        if lobby_code == code:
            socketid_lobby.pop(sid, None)


def lobby_removal(code, delay=600):
    timer = threading.Timer(delay, remove_lobby, args=[code])
    timer.daemon = True
    timer.start()


def get_users_by_player_ids(player_ids):
    users = (
        User.query.filter(User.user_id.in_(player_ids)).all()
        if player_ids
        else []
    )
    return {str(user.user_id): user for user in users}


def build_player_entry(player_id, users_by_user_id, default_card_back, profile_picture):
    player_key = str(player_id)
    user = users_by_user_id.get(player_key)
    card_back_url = default_card_back
    s3_bucket = os.getenv("S3_BUCKET_NAME")

    if user:
        profile_picture = f"https://{s3_bucket}.s3.amazonaws.com/{user.profile_picture_url}"
        if user.card_back_id:
            card_gallery_entry = CardGallery.query.filter_by(id=user.card_back_id).first()
            if card_gallery_entry:
                card_back_url = f"https://{s3_bucket}.s3.amazonaws.com/{card_gallery_entry.img_url}"

    return {
        "id": player_key,
        "name": user.username if user else player_key,
        "cardBackUrl": card_back_url,
        "profilePicture": profile_picture,
    }


def send_datas_on_game_created(data):
    player_ids = list((data.get("players") or {}).keys())
    users_by_user_id = get_users_by_player_ids(player_ids)
    default_card_back = "uwu" if data.get("theme") else "basic"
    profile_picture = "default"

    payload = {
        "roomName": data.get("code"),
        "players": [
            build_player_entry(player_id, users_by_user_id, default_card_back, profile_picture)
            for player_id in player_ids
        ],
        "botNbr": data.get("bots", 0),
        "theme": "UWU" if data.get("theme") else "BASE",
    }
    try:
        response = requests.post(GAME_CREATE_URL, json=payload, timeout=5)
        response.raise_for_status()
    except requests.RequestException as exc:
        return False, f"Unable to create game: {exc}"
    return True, payload


def send_datas_on_game_joined(data):
    player_id = data.get("player_id")
    if player_id is None:
        return False, "Missing player id"

    default_card_back = "uwu" if data.get("theme") else "basic"
    users_by_user_id = get_users_by_player_ids([player_id])
    profile_picture = "default"
    payload = {
        "player": [
            build_player_entry(player_id, users_by_user_id, default_card_back, profile_picture)
        ]
    }
    try:
        response = requests.post(GAME_JOIN_URL, json=payload, timeout=5)
        response.raise_for_status()
    except requests.RequestException as exc:
        return False, f"Unable to join game: {exc}"
    return True, payload
