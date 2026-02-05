import jwt, hashlib, os
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from app.extensions import db, cache_token
from app.models.refresh_tokens import RefreshToken
from app.schemas.refresh_tokens import refresh_token_schema
from werkzeug.datastructures.headers import EnvironHeaders

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

def store_session_token(encoded, public, private, user_id, tid):
	cache_token[encoded] = [public, private, user_id, tid]

def delete_session_token(key):
	cache_token[key] = None

def wrap_new_session_token(token, public):
	return {"token": token, "public": public}
