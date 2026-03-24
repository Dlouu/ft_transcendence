from flask import Blueprint, render_template, redirect, url_for
from app.core.extensions import socketio

lobby = Blueprint("lobby", __name__)

@socketio.on("join_lobby")
def lobby_room(code):
    if not code:
        return ("No code provided", 405)
        #return redirect(url_for("lobby.home"))
    code = code.strip().upper()
    return ("Success", 200)

@socketio.on("game_start")
def starting_game(code):
    return ("Success", 200)
