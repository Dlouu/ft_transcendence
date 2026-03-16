from flask import Blueprint, render_template, redirect, url_for

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
@lobby.route("/lobby/<code>", methods=["GET"])
def lobby_room(code):
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
