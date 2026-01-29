from flask import Flask, render_template, Blueprint, request, redirect, url_for
import random
import string

lobby = Blueprint("lobby", __name__)

lobbies = set()

@lobby.route("/")
def home():
	return render_template("home.html")

lobby_count = 0;

@lobby.route("/create_lobby", methods=["POST"])
def create_lobby():
	chars = random.choices(string.ascii_uppercase + string.digits, k=4)
	lobby_room = ''.join(chars)
	lobbies.add(lobby_room)
	return redirect(url_for("lobby.join_lobby", code=lobby_room))

@lobby.route("/join_lobby", methods=["POST"])
def join_lobby_post():
    user_code = request.form.get("code", "").strip().upper()
    if user_code not in lobbies:
        return "wrong room code"
    return redirect(url_for("lobby.join_lobby", code=user_code))

@lobby.route("/<code>", methods=["GET"])
def join_lobby(code):
    code = code.strip().upper()
    if code not in lobbies:
        return "wrong room code"
    return render_template("lobby.html", code=code)
