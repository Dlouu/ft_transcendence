from flask import request, session
from flask_socketio import emit

from app.core.extensions import socketio, db
from app.models.friends import Friends
from app.models.user import User


#adding friends
@socketio.on("accept_friend")
def accept_friend(data):
    requester_id = data.get("requester_id")
    accepter_id = data.get("accepter_id") or session.get("user_id")

    friend = Friends.query.filter_by(
        requester_id=requester_id,
        accepter_id=accepter_id
    ).first()

    if not friend:
        emit("friend_error", {"message": "Friend request not found"})
        return

    friend.status = "accepted"
    db.session.commit()

    requester = User.query.get(requester_id)
    emit("friend_updated", {
        "username": requester.username if requester else None,
        "requester_id": requester_id,
        "accepter_id": accepter_id,
        "status": friend.status
    }, to=request.sid)


@socketio.on("reject_friend")
def reject_friend(data):
    requester_id = data.get("requester_id")
    accepter_id = data.get("accepter_id") or session.get("user_id")

    friend = Friends.query.filter_by(
        requester_id=requester_id,
        accepter_id=accepter_id
    ).first()

    if not friend:
        emit("friend error", {"message": "Friend request not found"})
        return

    friend.status = "rejected"
    db.session.commit()

    requester = User.query.get(requester_id)
    emit("friend_updated", {
        "username": requester.username if requester else None,
        "requester_id": requester_id,
        "accepter_id": accepter_id,
        "status": friend.status
    }, to=request.sid)

@socketio.on("add_friend")
def add_friend(data):
    socket_id = (data.get("username") or "").strip()
    requester_id = session.get("user_id")

    if not requester_id:
        emit("friend_request_sent", {"username": socket_id, "status": "not logged", "type": "sent"}, to=request.sid)
        return

    user = User.query.filter_by(username=socket_id).first()
    if not user:
        emit("friend_request_sent", {"username": socket_id, "status": "not found", "type": "sent"}, to=request.sid)
        return

    accepter_id = user.id

    friend = Friends(requester_id=requester_id, accepter_id=accepter_id, status="pending")
    db.session.add(friend)
    db.session.commit()

    emit("friend_request_sent", {"username": socket_id, "status": "pending", "type": "sent"}, to=request.sid)
    emit("friend_request_sent", {"username": session.get("username"), "status": "pending", "type": "received", "user_id": requester_id}, to=user.username)
