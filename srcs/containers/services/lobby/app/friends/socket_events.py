from flask import request, session
from flask_socketio import emit

from app.core.extensions import socketio


#adding friends
@socketio.on("accept_friend")
def accept_friend(data):
    requester_id = data.get("requester_id")
    accepter_id = data.get("accepter_id")

    friend = Friends.query.filter_by(
        requester_id=requester_id,
        accepter_id=accepter_id
    ).first()

    if not friend:
        emit("friend_error", {"message": "Friend request not found"})
        return

    friend.status = "accepted"
    db.session.commit()

    emit("friend_updated", {
        "requester_id": requester_id,
        "accepter_id": accepter_id,
        "status": friend.status
    }, to=request.sid)


@socketio.on("reject_friend")
def reject_friend(data):
    requester_id = data.get("requester_id")
    accepter_id = data.get("accepter_id")

    friend = Friends.query.filter_by(
        requester_id=requester_id,
        accepter_id=accepter_id
    )

    if not friend:
        emit("friend error", {"message": "Friend request not found"})
        return

    friend.status = "rejected"
    db.session.commit()

    emit("friend_updated", {
        "requester_id": requester_id,
        "accepter_id": accepter_id,
        "status": friend.status
    }, to=request.sid)

@socketio.on("add_friend")
def add_friend(data):
    username = data.get("username")
    accepter_id = session.get("user_id")

    user = User.query.filter_by(username=username).first()
    if not user:
        emit("friend_request_send", {"username": username, "status": "not found", "type": "sent"}, to=request.sid)
        return

    requester_id = accepter_id
    accepter_id = user.id

    friend = Friends(requester_id=requester_id, accepter_id=accepter_id, status="pending")
    db.session.add(friend)
    db.sessino.commit()

    emit("friend_request_sent", {"username": username, "status": "pending", "type": "sent"}, to=request.sid)
    emit("friend_request_sent", {"username": session.get("username"), "status": "pending", "type": "received", "user_id": requester_id}, to=user.sid)
