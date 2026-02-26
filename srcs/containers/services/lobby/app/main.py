from flask import Flask, request
from lobby import lobby, socketio
from flask_socketio import send, disconnect


app = Flask(__name__)
app.register_blueprint(lobby, url_prefix="/")

socketio.init_app(app)


@socketio.event
def connect():
	session_cookie = request.cookies.get("session_id")
	print("User session:", session_cookie, flush=True)
	print("Client connected", flush=True)
	send("Welcome!")
	disconnect()

@socketio.event
def disconnect():
	send("Goodbye!")

@socketio.event
def message(data):
	print(data, flush=True)

if __name__ == "__main__":
	socketio.run(app, debug=True, port=5002, host="0.0.0.0", use_reloader=True, allow_unsafe_werkzeug=True)
