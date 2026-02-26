from flask import Blueprint, render_template, request, redirect, url_for
from app.core.state import lobbies

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
GET /join_lobby

📥 Receives:
- code (query parameter)

📤 Returns:
- HTML template "game.html"
- Error message if the code is invalid

🎯 Purpose:
Displays the lobby page after successful creation.
"""
@lobby.route("/join_lobby", methods=["GET"])
def join_lobby():
    code = request.args.get("code")
    if not code:
        return redirect(url_for("lobby.home"))
    code = code.strip().upper()
    return render_template("lobby.html", code=code)

"""
GET /game/<code>

📥 Receives:
- code (str): lobby room code

📤 Returns:
- has to return the html page of the game (game.html is juste ici pour la deco)

🎯 Purpose:
Renders the game page once the match has started.
"""
@lobby.route("/game/<code>", methods=["GET"])
def starting_game(code):
    return render_template("game.html", code=code)
