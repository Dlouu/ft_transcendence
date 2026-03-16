from flask import Flask

from app.core.extensions import socketio, db
from app.routes.lobby import lobby
from app.lobbies.debug import lobby as lobby_debug
import app.lobbies.socket_events
import app.friends.socket_events
import os


def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("FLASK_SECRET_KEY", "hihi")

    database_uri = os.getenv("USER_DATABASE_URI") or os.getenv("SQLALCHEMY_DATABASE_URI")
    if database_uri:
        app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
        app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        db.init_app(app)
    else:
        print("Lobby: USER_DATABASE_URI is not set; DB features are disabled.", flush=True)

    app.register_blueprint(lobby)
    app.register_blueprint(lobby_debug)

    socketio.init_app(app)

    return app
