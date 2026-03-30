from flask import request, session
from flask_socketio import emit

from app.core.extensions import socketio, db
from app.models.friends import Friends
from app.models.user import User
from app.core.state import lobbies


def is_online(username):
    try:
        participants = socketio.server.manager.get_participants("/", username)
        return len(list(participants)) > 0
    except Exception:
        return False


def is_in_game(external_user_id):
    for lobby_data in lobbies.values():
        if (
            lobby_data.get("game_started")
            and not lobby_data.get("game_ended")
            and external_user_id in lobby_data.get("players", {})
        ):
            return True
    return False


def is_in_lobby(external_user_id):
    for lobby_data in lobbies.values():
        if (
            not lobby_data.get("game_started")
            and not lobby_data.get("game_ended")
            and external_user_id in lobby_data.get("players", {})
        ):
            return True
    return False


def notify_friends_status(user_id, username, status):
    """Notifie tous les amis acceptés du changement de statut online/offline/in_lobby/in_game."""
    rows = Friends.query.filter(
        db.or_(
            Friends.requester_id == user_id,
            Friends.accepter_id == user_id
        ),
        Friends.status == "accepted"
    ).all()

    online = status == "online"
    if online:
        me = User.query.get(user_id)
        in_game = is_in_game(me.user_id) if me else False
        in_lobby = is_in_lobby(me.user_id) if me else False
    else:
        in_game = False
        in_lobby = False

    for row in rows:
        other_id = row.accepter_id if row.requester_id == user_id else row.requester_id
        other = User.query.get(other_id)
        if other:
            emit("friend_status", {
                "username": username,
                "online": online,
                "in_game": in_game,
                "in_lobby": in_lobby,
            }, to=other.username)


def notify_players_ingame_status(lobby_data, in_game):
    """Notifie les amis de tous les joueurs d'un lobby du changement de statut in_game."""
    for external_user_id in lobby_data.get("players", {}):
        user = User.query.filter_by(user_id=external_user_id).first()
        if not user:
            continue
        rows = Friends.query.filter(
            db.or_(
                Friends.requester_id == user.id,
                Friends.accepter_id == user.id
            ),
            Friends.status == "accepted"
        ).all()
        for row in rows:
            other_id = row.accepter_id if row.requester_id == user.id else row.requester_id
            other = User.query.get(other_id)
            if other:
                socketio.emit("friend_status", {
                    "username": user.username,
                    "online": is_online(user.username),
                    "in_game": in_game,
                    "in_lobby": False,
                }, to=other.username)

@socketio.on("remove_friend")
def remove_friend(data):
    other_username = (data.get("username") or "").strip()
    user_id = _get_db_user_id()

    if not user_id:
        emit("friend_error", {"message": "Not logged"})
        return

    other = User.query.filter_by(username=other_username).first()
    if not other:
        emit("friend_error", {"message": "User not found"})
        return

    friend = Friends.query.filter(
        db.or_(
            db.and_(Friends.requester_id == user_id, Friends.accepter_id == other.id),
            db.and_(Friends.requester_id == other.id, Friends.accepter_id == user_id)
        )
    ).first()

    if not friend:
        emit("friend_error", {"message": "No friendship found"})
        return

    db.session.delete(friend)
    db.session.commit()

    my_username = session.get("username")
    emit("friend_removed", {"username": other_username}, to=request.sid)
    emit("friend_removed", {"username": my_username}, to=other.username)


def _get_db_user_id():
    db_user_id = session.get("db_user_id")
    if db_user_id:
        return db_user_id

    external_user_id = session.get("user_id")
    if not external_user_id:
        return None

    user = User.query.filter_by(user_id=external_user_id).first()
    if not user:
        return None

    session["db_user_id"] = user.id
    if not session.get("username"):
        session["username"] = user.username
    return user.id


@socketio.on("get_friends")
def get_friends():
    user_id = _get_db_user_id()
    if not user_id:
        emit("friend_error", {"message": "Not logged"})
        return

    rows = Friends.query.filter(
        db.or_(
            Friends.requester_id == user_id,
            Friends.accepter_id == user_id
        )
    ).all()

    friends = []
    pending_requests = []

    for row in rows:
        is_requester = row.requester_id == user_id
        other_id = row.accepter_id if is_requester else row.requester_id
        other = User.query.get(other_id)
        if not other:
            continue

        if row.status == "accepted":
            friends.append({"username": other.username, "id": other.id, "status": "accepted", "online": is_online(other.username), "in_game": is_in_game(other.user_id), "in_lobby": is_in_lobby(other.user_id)})
        elif row.status == "pending":
            if is_requester:
                friends.append({"username": other.username, "id": other.id, "status": "pending"})
            else:
                pending_requests.append({"username": other.username, "user_id": other.id})

    emit("friends_list", {"friends": friends, "pending_requests": pending_requests}, to=request.sid)


#adding friends
@socketio.on("accept_friend")
def accept_friend(data):
    requester_id = data.get("requester_id")
    accepter_id = _get_db_user_id()  # toujours depuis la session, jamais du client

    if not accepter_id:
        emit("friend_error", {"message": "Not logged"})
        return

    friend = Friends.query.filter_by(
        requester_id=requester_id,
        accepter_id=accepter_id
    ).first()

    if not friend:
        emit("friend_error", {"message": "Friend request not found"})
        return

    if friend.status != "pending":
        emit("friend_error", {"message": "Friend request is not pending"})
        return

    friend.status = "accepted"
    db.session.commit()

    requester = User.query.get(requester_id)
    payload = {
        "username": requester.username if requester else None,
        "requester_id": requester_id,
        "accepter_id": accepter_id,
        "status": friend.status
    }
    emit("friend_updated", payload, to=request.sid)
    if requester:
        emit("friend_updated", payload, to=requester.username)


@socketio.on("reject_friend")
def reject_friend(data):
    requester_id = data.get("requester_id")
    accepter_id = _get_db_user_id()  # toujours depuis la session, jamais du client

    if not accepter_id:
        emit("friend_error", {"message": "Not logged"})
        return

    friend = Friends.query.filter_by(
        requester_id=requester_id,
        accepter_id=accepter_id
    ).first()

    if not friend:
        emit("friend_error", {"message": "Friend request not found"})
        return

    if friend.status != "pending":
        emit("friend_error", {"message": "Friend request is not pending"})
        return

    friend.status = "rejected"
    db.session.commit()

    requester = User.query.get(requester_id)
    payload = {
        "username": requester.username if requester else None,
        "requester_id": requester_id,
        "accepter_id": accepter_id,
        "status": friend.status
    }
    emit("friend_updated", payload, to=request.sid)
    if requester:
        emit("friend_updated", payload, to=requester.username)

@socketio.on("add_friend")
def add_friend(data):
    target_username = (data.get("username") or "").strip()
    requester_id = _get_db_user_id()

    if not requester_id:
        emit("friend_request_sent", {"username": target_username, "status": "not logged", "type": "sent"}, to=request.sid)
        return

    user = User.query.filter_by(username=target_username).first()
    if not user:
        emit("friend_request_sent", {"username": target_username, "status": "not found", "type": "sent"}, to=request.sid)
        return

    accepter_id = user.id

    if accepter_id == requester_id:
        emit("friend_request_sent", {"username": target_username, "status": "self", "type": "sent"}, to=request.sid)
        return

    existing = Friends.query.filter(
        db.or_(
            db.and_(Friends.requester_id == requester_id, Friends.accepter_id == accepter_id),
            db.and_(Friends.requester_id == accepter_id, Friends.accepter_id == requester_id)
        )
    ).first()
    if existing:
        emit("friend_request_sent", {"username": target_username, "status": existing.status, "type": "sent"}, to=request.sid)
        return

    friend = Friends(requester_id=requester_id, accepter_id=accepter_id, status="pending")
    db.session.add(friend)
    db.session.commit()

    emit("friend_request_sent", {"username": target_username, "status": "pending", "type": "sent"}, to=request.sid)
    emit("friend_request_sent", {"username": session.get("username"), "status": "pending", "type": "received", "user_id": requester_id}, to=user.username)


@socketio.on("get_friend_status")
def get_friend_status(data):
    """Retourne le statut en temps réel d'un ami spécifique (online/in_lobby/in_game)."""
    target_username = (data.get("username") or "").strip()
    if not target_username:
        return

    user_id = _get_db_user_id()
    if not user_id:
        return

    target = User.query.filter_by(username=target_username).first()
    if not target:
        return

    friendship = Friends.query.filter(
        Friends.status == "accepted",
        db.or_(
            db.and_(Friends.requester_id == user_id, Friends.accepter_id == target.id),
            db.and_(Friends.requester_id == target.id, Friends.accepter_id == user_id),
        )
    ).first()
    if not friendship:
        return

    emit("friend_status", {
        "username": target.username,
        "online": is_online(target.username),
        "in_game": is_in_game(target.user_id),
        "in_lobby": is_in_lobby(target.user_id),
    }, to=request.sid)
