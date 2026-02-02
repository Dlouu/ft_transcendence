import jwt
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import hashlib
from app.extensions import db
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
	print(token_payload, flush=True)

	try:
		token_load = refresh_token_schema.load(token_payload)
		db.session.add(token_load)
		db.session.commit()
	except Exception as e:
		db.session.rollback()
		print(e, flush=True)
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
		"exp": datetime.now(tz=timezone.utc) + timedelta(seconds=2)
	}

	encoded_jwt = jwt.encode(payload, private_pem, algorithm="RS256")

	return encoded_jwt, public_pem, private_pem

cache_token = {}
def store_session_token(encoded, public, private, user_id):
	cache_token[encoded] = [public, private, user_id]

def is_refresh_token_valid(user_id, headers, remote_addr):
	data = RefreshToken.query.filter_by(user_id=user_id)

	if not data:
		return False

	print(type(data), flush=True)

from flask import Blueprint, request

token_handler = Blueprint("token_handler", __name__)

@token_handler.route("/update", methods=["GET"])
def update_token():
	print(request.headers, flush=True)
	print(request.json, flush=True)
	auth_header = request.headers.get("Authorization")

	if not auth_header or not auth_header.startswith("Bearer "):
		return {"message": "Missing or invalid token"}, 401

	token = auth_header.split(" ", 1)[1]

	if token not in cache_token:
		return {"message": "Invalid token."}, 401

	if not is_refresh_token_valid(cache_token[token][2], request.headers, request.remote_addr):
		return {"message": "Refresh token expired."}, 401

	print(cache_token[token], flush=True)
	return {}, 200



'''
	make a function to create a refresh token
	make a task to check refresh token expiration
	make a function to create a session token based on the refresh token
	make a function to check if the active refresh token is equal to the one the client sent
'''
