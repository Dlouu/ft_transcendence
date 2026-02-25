from redis.exceptions import ConnectionError
from app.extensions import cache_token, r
import jwt

from app.utils.logger import logger

UNAVAILABLE_MESSAGE = "WARNING: Redis is unavailable, the service might be offline."

def does_session_token_exist(key):
	"""
	Check if the given token exist in redis.

	param:
		key: The token you are looking for.

	return:
		True if found, else False.
	"""
	try:
		r.ping()
	except ConnectionError:
		logger.critical(UNAVAILABLE_MESSAGE, extra=logger.extra(target_service="redis"))
		return None

	return r.exists(f"token:{key}")

def decode_session_token(key):
	"""
	Decode the given token WITHOUT handling exception, you need to create this logic when you use this function.

	param:
		key: The token you want to decode.

	return:
		None if the token don't exist, else the decoded token (payload).
	"""
	try:
		r.ping()
	except ConnectionError:
		logger.critical(UNAVAILABLE_MESSAGE, extra=logger.extra(target_service="redis"))
		return None

	if not does_session_token_exist(key):
		return None

	data = r.hgetall(f"token:{key}")
	payload = jwt.decode(key, data["public"], algorithms="RS256")

	return payload

def get_token_from_request(request):
	auth_header = request.headers.get("Authorization")

	if not auth_header or not auth_header.startswith("Bearer "):
		return None

	return auth_header.split(" ", 1)[1]
