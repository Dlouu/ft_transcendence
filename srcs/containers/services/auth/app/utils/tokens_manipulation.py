import jwt, hashlib, os
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from app.extensions import db, cache_token
from app.models.refresh_tokens import RefreshToken
from app.schemas.refresh_tokens import refresh_token_schema
from werkzeug.datastructures.headers import EnvironHeaders

def generate_refresh_token(user_id, headers, remote_addr):
	if not isinstance(headers, EnvironHeaders) or "User-Agent" not in headers:
		return None

	raw_data = headers["User-Agent"] + remote_addr + "wegoweg4384" + str(user_id)
	hash_data = hashlib.sha256(raw_data.encode())
	return hash_data.hexdigest()

def store_refresh_token(user_id, refresh_token, expire_date):
	token_payload = {"user_id": user_id, "last_token": None, "active_token": refresh_token, "expire_date": expire_date}

	try:
		token_load = refresh_token_schema.load(token_payload)
		db.session.add(token_load)
		db.session.commit()
	except Exception as e:
		db.session.rollback()
		print(e, flush=True)
		print("Undefined exception have been raised in 'store_refresh_token', resolve this or handle this behavior.", flush=True)
		return False

	return True

def generate_session_token(user_id, headers, remote_addr):
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

	payload = {
		"user_id": user_id,
		"agent": headers["User-Agent"],
		"remote_addr": remote_addr,
		# "exp": datetime.now(tz=timezone.utc) + timedelta(seconds=int(os.getenv("SESSION_TOKEN_EXPIRATION")))
		"exp": datetime.now(tz=timezone.utc) + timedelta(seconds=0)
	}

	encoded_jwt = jwt.encode(payload, private_pem, algorithm="RS256")

	return encoded_jwt, public_pem, private_pem

def store_session_token(encoded, public, private, user_id):
	cache_token[encoded] = [public, private, user_id]

def delete_session_token(key):
	cache_token[key] = None

def is_refresh_token_valid(user_id, headers, remote_addr):
	tokens = RefreshToken.query.filter_by(user_id=user_id)

	if not tokens:
		return False

	for token in tokens:
		if generate_refresh_token(user_id, headers, remote_addr) == token.active_token:
			return True
		elif generate_refresh_token(user_id, headers, remote_addr) == token.last_token:
			token.last_token = None
			db.session.commit()
			return True

	return False

def wrap_new_session_token(token, public):
	return {"token": token, "public": public}
