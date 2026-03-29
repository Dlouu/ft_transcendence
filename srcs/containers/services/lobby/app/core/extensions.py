from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from redis.exceptions import ConnectionError
import redis
import os

socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")
db = SQLAlchemy()

try:
    r = redis.from_url(os.getenv("REDIS_URL", ""), decode_responses=True)
    r.ping()
except ValueError as e:
    print(f"A problem occured when trying to connect to redis from url ({e})", flush=True)
    r = None
except ConnectionError as e:
    print(f"Failed to ping redis, service will be unavailable ({e})", flush=True)
    r = None
