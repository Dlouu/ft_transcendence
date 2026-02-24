from flask_sqlalchemy import SQLAlchemy
from redis.exceptions import ConnectionError
import redis, os

from app.utils.logger import logger

db = SQLAlchemy()

r = None
try:
	r = redis.from_url(os.getenv("REDIS_URL", ""), decode_responses=True)
	r.ping()
	logger.info("Redis ready.", extra=logger.extra(target_service="redis"))
except ValueError as e:
	logger.fatal(f"A problem occured when trying to connect to redis from url, to avoid any undefined behavior the API will stop. ({e})", extra=logger.extra(target_service="redis"))
	exit(1)
except ConnectionError as e:
	logger.fatal(f"Failed to ping redis, to avoid any undefined behavior the API will stop ({e})", extra=logger.extra(target_service="redis"))
	exit(1)
