import jwt
from app.extensions import cache_token, r

UNAVAILABLE_MESSAGE = "WARNING: Redis is unavailable, the service might be offline or bad configured in this one."

def does_session_token_exist(key):
	"""
	Check if the given token exist in redis.

	param:
		key: The token you are looking for.

	return: True if found, else False.
	"""
	if not r:
		print(UNAVAILABLE_MESSAGE, flush=True)
		return None

	return r.exists(f"token:{key}")

def decode_session_token(key):
	"""
	Decode the given token WITHOUT handling exception, you need to create this logic when you use this function.

	param:
		key: The token you want to decode.

	return: None if the token don't exist, else the decoded token (payload).
	"""
	if not r:
		print(UNAVAILABLE_MESSAGE, flush=True)

	if not does_session_token_exist(key):
		return None
	data = r.hgetall(f"token:{key}")

	payload = jwt.decode(key, data["public"], algorithms="RS256")
	return payload
