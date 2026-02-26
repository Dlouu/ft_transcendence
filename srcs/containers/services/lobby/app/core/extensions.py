from flask_socketio import SocketIO

#need to change in prod
socketio = SocketIO(cors_allowed_origins="*")