from flask_sqlalchemy import SQLAlchemy
from redis.exceptions import ConnectionError
import redis, os

db = SQLAlchemy()
try:
	r = redis.from_url(os.getenv("REDIS_URL", ""), decode_responses=True)
	r.ping()
except ValueError as e:
	print(f"A problem occured when trying to connect to redis from url ({e})", flush=True)
except ConnectionError as e:
	print(f"Failed to ping redis, service will be unavailable ({e})", flush=True)
