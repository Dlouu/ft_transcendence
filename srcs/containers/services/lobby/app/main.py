from app import create_app
from app.core.extensions import socketio
app = create_app()

if __name__ == "__main__":
	app.run(debug=True, host="0.0.0.0", port=5002)