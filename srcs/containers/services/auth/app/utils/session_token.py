import jwt, hashlib, os
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from app.extensions import r

UNAVAILABLE_MESSAGE = "WARNING: Redis is unavailable, the service might be offline or bad configured in this one."

def generate_session_token(user_id, tid, headers, remote_addr):
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

	encoded_jwt = jwt.encode(payload, private_pem, algorithm="RS256"), created_at

	return encoded_jwt, public_pem, private_pem

def store_session_token(key, public, user_id):
	if not r:
		print(UNAVAILABLE_MESSAGE, flush=True)
		return None

	r.hset(f"token:{key}", mapping={"public": public, "user_id": user_id})

def delete_session_token(key):
	if not r:
		print(UNAVAILABLE_MESSAGE, flush=True)
		return None

	r.delete(f"token:{key}")

def does_session_token_exist(key):
	if not r:
		print(UNAVAILABLE_MESSAGE, flush=True)
		return None

	return r.exists(f"token:{key}")

def decode_session_token(key):
	if not r:
		print(UNAVAILABLE_MESSAGE, flush=True)
		return None

	if not does_session_token_exist(key):
		return None
	data = r.hgetall(f"token:{key}")

	payload = jwt.decode(key, data["public"], algorithms="RS256")
	return payload

def get_token_associated_data(key):
	if not r:
		print(UNAVAILABLE_MESSAGE, flush=True)
		return None

	if not does_session_token_exist(key):
		return None

	return r.hgetall(f"token:{key}")

def wrap_new_session_token(token, public):
	return {"token": token, "public": public}
