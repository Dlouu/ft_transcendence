from redis.exceptions import ConnectionError
from functools import wraps

from app.utils.logger import logger
from app import extensions

def redis_health_check(self):
	def decorator(f):
		@wraps(f)
		def decorated(*args, **kwargs):
			try:
				if extensions.r is None:
					extensions.r = redis.from_url(os.getenv("REDIS_URL", ""), decode_responses=True)
				extensions.r.ping()
			except ValueError as e:
				logger.fatal("A problem occured when trying to connect to redis from url.", extra=logger.extra(target_service="redis", exception=e))
				return {"message": "Service unavailable."}, 503
			except ConnectionError as e:
				logger.fatal("Connection error with redis's service.", extra=logger.extra(target_service="redis", exception=e))
				return {"message": "Service unavailable."}, 503
			except Exception as e:
				logger.fatal("Undefined error happened while trying to ping redis's service.", extra=logger.extra(target_service="redis", exception=e))
				return {"message": "Service unavailable."}, 503
			return f(*args, **kwargs)
		return decorated
	return decorator
