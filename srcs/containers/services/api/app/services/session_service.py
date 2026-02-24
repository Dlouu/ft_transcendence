import jwt
from app.extensions import cache_token, r

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

	if not does_session_token_exist(key):
		return None

	data = r.hgetall(f"token:{key}")
	payload = jwt.decode(key, data["public"], algorithms="RS256")

	return payload

def delete_session_token(key):
	"""
	Delete the given key from redis cache.
	This function dont check the validy of his arguments so make sure to make these verification before using this.

	param:
		key: the token you want to remove, it is only removed from the cache but the token stay valid.

	return:
		True if the token have been successfully removed from redis cache.
	"""
	if not r:
		print(UNAVAILABLE_MESSAGE, flush=True)
		return False

	r.delete(f"token:{key}")
	return True

def get_token_from_request(request):
	auth_header = request.headers.get("Authorization")

	if not auth_header or not auth_header.startswith("Bearer "):
		return None

	return auth_header.split(" ", 1)[1]
