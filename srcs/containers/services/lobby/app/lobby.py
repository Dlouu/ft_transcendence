from flask import Flask, render_template, Blueprint, request, redirect, url_for
import random
import string

lobby = Blueprint("lobby", __name__)

lobbies = set()

@lobby.route("/")
def home():
	return render_template("home.html")

def unique_code():
    return ''.join(random.choice(string.ascii_lowercase + string_digits, k=4))

#create a lobby
@lobby.route("/create_lobby", methods=["POST"])
def create_lobby():
    # max_attempts = 3
    # attempts = 0
    # while attempts < max_attempts:
    #     lobby_room = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
    #     if lobby_room not in lobbies:
    #         lobbies.add(lobby_room)
    #         return redirect(url_for("lobby.join_lobby", code=lobby_room))
    #     attempts += 1
    # return "No more rooms available"
    room_name = request.form.get("room_name", "").strip().upper()
    if not room_name:
        return "Room name is required", 601
    #4 characteres uniquements + alnum
    if room_name in lobbies:
        return "Room already exists", 602
    if len(lobbies) < 1679616:
        lobbies.add(room_name)
    else:
        return "No more rooms avalaible", 603
    return redirect(url_for("lobby.join_lobby", code=room_name))

#joining lobby by code
@lobby.route("/join_lobby", methods=["POST"])
def join_lobby_post():
    user_code = request.form.get("code", "").strip().upper()
    if user_code not in lobbies:
        return "wrong room code"
    return redirect(url_for("lobby.join_lobby", code=user_code))


#joining lobby after creation
@lobby.route("/join_lobby", methods=["GET"])
def join_lobby():
    code = request.args.get("code", "").strip().upper()
    if not code or code not in lobbies:
        return "wrong room code"
    return render_template("game.html", code=code)


