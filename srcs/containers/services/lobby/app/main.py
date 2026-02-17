from flask import Flask
from lobby import lobby, socketio

app = Flask(__name__)
app.register_blueprint(lobby, url_prefix="/")

socketio.init_app(app)

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5002, host="0.0.0.0", use_reloader=True, allow_unsafe_werkzeug=True)

