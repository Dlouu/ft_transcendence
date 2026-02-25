from flask_sqlalchemy import SQLAlchemy
from redis.exceptions import ConnectionError
import redis, os

from app.utils.logger import logger

db = SQLAlchemy()

r = None
try:
	r = redis.from_url(os.getenv("REDIS_URL", ""), decode_responses=True)
	r.ping()
	logger.info("Redis ready.", extra=logger.extra(target="redis"))
except ValueError as e:
	logger.fatal("A problem occured when trying to connect to redis from url.", extra=logger.extra(target="redis", exception=e))
except ConnectionError as e:
	logger.fatal("Connection error with redis's service.", extra=logger.extra(target="redis", exception=e))
except Exception as e:
	logger.fatal("Undefined error happened while trying to ping redis's service.", extra=logger.extra(target="redis", exception=e))
