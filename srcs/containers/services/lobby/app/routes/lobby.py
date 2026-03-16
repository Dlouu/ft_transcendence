from flask import Blueprint, render_template, redirect, url_for
from app.core.extensions import socketio

lobby = Blueprint("lobby", __name__)

"""
Just here for dev
GET /
📥 Receives:
- HTTP GET request

📤 Returns:
- HTML template "home.html"

🎯 Purpose:
Displays the homepage.
"""
@lobby.route("/")
def home():
    return render_template("home.html")

"""
GET /lobby/<code>

📥 Receives:
- code (path parameter)

📤 Returns:
- HTML template "lobby.html"

🎯 Purpose:
Displays the lobby page for a given code.
"""
@socketio.on("join_lobby")
def lobby_room(code):
    if not code:
        return ("No code provided", 405)
        #return redirect(url_for("lobby.home"))
    code = code.strip().upper()
    return ("Success", 200)

"""
GET /game/<code>

📥 Receives:
- code (str): lobby room code

📤 Returns:
- has to return the html page of the game (game.html is juste ici pour la deco)

🎯 Purpose:
Renders the game page once the match has started.
"""
@socketio.on("game_start")
def starting_game(code):
    return ("Success", 200)
