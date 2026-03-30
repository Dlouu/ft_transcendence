from app import create_app
from app.core.extensions import socketio
app = create_app()

if __name__ == "__main__":
	socketio.run(app, debug=False, port=5002, host="0.0.0.0", use_reloader=False, allow_unsafe_werkzeug=True)
