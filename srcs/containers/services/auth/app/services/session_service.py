from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from datetime import datetime, timedelta, timezone
from redis.exceptions import ConnectionError
import jwt, hashlib, os

from app.utils.logger import logger
from app.extensions import r

UNAVAILABLE_MESSAGE = "WARNING: Redis is unavailable, the service might be offline or bad configured in this one."

def generate_session_token(user_id, tid, headers, remote_addr):
	"""
	Generate a new session token, it is used to verify if the user is allowed to request some specific endpoints.
	This function dont check the validy of his arguments so make sure to make these verification before using this.

	param:
		user_id: the user id
		tid: the refresh token id
		headers: the header of the request
		remote_addr: the remote address of the request, can be found using request.remote_addr

	return:
		The new token, the public key and the private key
	"""
	private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
	public_key = private_key.public_key()

	private_pem = private_key.private_bytes(
		encoding=serialization.Encoding.PEM,
		format=serialization.PrivateFormat.PKCS8,
		encryption_algorithm=serialization.NoEncryption()
	).decode("utf-8")

	public_pem = public_key.public_bytes(
		encoding=serialization.Encoding.PEM,
		format=serialization.PublicFormat.SubjectPublicKeyInfo
	).decode("utf-8")

	created_at = datetime.now(tz=timezone.utc) + timedelta(seconds=int(os.getenv("SESSION_TOKEN_EXPIRATION", "3600")))
	payload = {
		"user_id": user_id,
		"tid": tid,
		"agent": headers["User-Agent"],
		"remote_addr": remote_addr,
		"exp": created_at
	}

	encoded_jwt = jwt.encode(payload, private_pem, algorithm="RS256")

	return encoded_jwt, public_pem, private_pem, created_at

def store_session_token(key, public, user_id):
	"""
	Store the given key in redis cache.
	This function dont check the validy of his arguments so make sure to make these verification before using this.

	param:
		key: the token
		public: the public key
		user_id: the user id

	return:
		True if the token have been successfully stored in redis cache.
	"""
	try:
		r.ping()
	except ConnectionError:
		logger.critical(UNAVAILABLE_MESSAGE, extra=logger.extra(target_service="redis"))
		return False

	r.hset(f"token:{key}", mapping={"public": public, "user_id": user_id})
	r.expire(f"token:{key}", int(os.getenv("TOKEN_CACHE_LIFETIME", os.getenv("REFRESH_TOKEN_EXPIRATION", "3600"))))
	logger.info(f"New session token stored for user id {user_id}.", extra=logger.extra(category="token", user_id=user_id))
	return True

def delete_session_token(key, user_id=None):
	"""
	Delete the given key from redis cache.
	This function dont check the validy of his arguments so make sure to make these verification before using this.

	param:
		key: the token you want to remove, it is only removed from the cache but the token stay valid.

	return:
		True if the token have been successfully removed from redis cache.
	"""
	try:
		r.ping()
	except ConnectionError:
		logger.critical(UNAVAILABLE_MESSAGE, extra=logger.extra(target_service="redis"))
		return False

	r.delete(f"token:{key}")
	logger.info("Session token deleted" + "." if user_id is None else f" for user id {user_id}.",
		extra=logger.extra(category="token", user_id=user_id))
	return True

def does_session_token_exist(key):
	"""
	Check if the given key exist in redis cache.
	This function dont check the validy of his arguments so make sure to make these verification before using this.

	param:
		key: the token you want to check the existence.

	return:
		True if it exist otherwise False.
	"""
	try:
		r.ping()
	except ConnectionError:
		logger.critical(UNAVAILABLE_MESSAGE, extra=logger.extra(target_service="redis"))
		return None

	return r.exists(f"token:{key}")

def decode_session_token(key):
	"""
	Search for the given key in redis cache and decode the related token if it has been found.
	This function dont check the validy of his arguments so make sure to make these verification before using this.

	param:
		key: the token you want to check the existence.

	return:
		the decoded token (payload), else None.
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

def get_token_associated_data(key):
	"""
	Return the value stored for the given key.
	This function dont check the validy of his arguments so make sure to make these verification before using this.

	param:
		key: the token you want to get the data

	return:
		a dict containing the value stored, else None.
	"""
	try:
		r.ping()
	except ConnectionError:
		logger.critical(UNAVAILABLE_MESSAGE, extra=logger.extra(target_service="redis"))
		return None

	if not does_session_token_exist(key):
		return None

	return r.hgetall(f"token:{key}")

def wrap_new_session_token(token, public):
	return {"token": token, "public": public}
