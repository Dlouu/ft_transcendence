import jwt
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import hashlib
from app.extensions import db
from app.models.refresh_tokens import RefreshToken
from app.schemas.refresh_tokens import refresh_token_schema
from werkzeug.datastructures.headers import EnvironHeaders
import os

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

cache_token = {}
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

from flask import Blueprint, request

token_handler = Blueprint("token_handler", __name__)

@token_handler.route("/update", methods=["GET"])
def update_token():
	auth_header = request.headers.get("Authorization")

	if not auth_header or not auth_header.startswith("Bearer "):
		return {"message": "Missing or invalid token"}, 401

	token = auth_header.split(" ", 1)[1]

	if token not in cache_token:
		return {"message": "Invalid token."}, 401

	user_id = cache_token[token][2]
	if not is_refresh_token_valid(user_id, request.headers, request.remote_addr):
		return {"message": "Refresh token expired."}, 401

	delete_session_token(token)
	token, public, private = generate_session_token(user_id, request.headers, request.remote_addr)
	store_session_token(token, public, private, user_id)

	response = wrap_new_session_token(token, public)
	response["message"] = "success"

	return response, 200

'''
	make a function to create a refresh token
	make a task to check refresh token expiration
	make a function to create a session token based on the refresh token
	make a function to check if the active refresh token is equal to the one the client sent
'''
