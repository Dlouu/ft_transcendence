from flask import Flask

from app.core.extensions import socketio
from app.routes.lobby import lobby
from app.lobbies.http import lobby as lobby_http
from app.lobbies.debug import lobby as lobby_debug
import app.lobbies.socket_events
import app.friends.socket_events
import os


def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("FLASK_SECRET_KEY", "hihi")

    app.register_blueprint(lobby)
    app.register_blueprint(lobby_http)
    app.register_blueprint(lobby_debug)

    socketio.init_app(app)

    return app