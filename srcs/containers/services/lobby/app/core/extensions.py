from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

#need to change in prod
socketio = SocketIO(cors_allowed_origins="*")
db = SQLAlchemy()
