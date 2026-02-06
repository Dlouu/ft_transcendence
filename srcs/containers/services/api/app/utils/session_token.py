import jwt
from app.extensions import cache_token, r

UNAVAILABLE_MESSAGE = "WARNING: Redis is unavailable, the service might be offline or bad configured in this one."

def does_session_token_exist(key):
	if not r:
		print(UNAVAILABLE_MESSAGE, flush=True)
		return None

	return r.exists(f"token:{key}")

def decode_session_token(key):
	if not r:
		print(UNAVAILABLE_MESSAGE, flush=True)

	if not does_session_token_exist(key):
		return None
	data = r.hgetall(f"token:{key}")

	payload = jwt.decode(key, data["public"], algorithms="RS256")
	return payload
