from flask import Blueprint
import jwt
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric import rsa
import hmac
import hashlib
from app.extensions import db
from app.models.refresh_tokens import RefreshToken
from app.schemas.refresh_tokens import refresh_token_schema
from marshmallow.exceptions import ValidationError
from werkzeug.datastructures.headers import EnvironHeaders

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

encoded_jwt = jwt.encode({"some": "payload", "exp": datetime.now(tz=timezone.utc) + timedelta(seconds=5)}, private_key, algorithm="RS256")
print(encoded_jwt, flush=True)

decoded_jwt = jwt.decode(encoded_jwt, public_key, algorithms="RS256")
print(decoded_jwt, flush=True)

# private_key2 = rsa.generate_private_key(public_exponent=65537, key_size=2048)
# public_key2 = private_key2.public_key()

# import time
# time.sleep(5)
# decoded_jwt = jwt.decode(encoded_jwt, public_key2, algorithms="RS256")
print(decoded_jwt, flush=True)
# tkn = Blueprint("token", __name__)

# tkn.route("/session_token", methods=["POST"])
# def session_token():


# def handle_tokens(headers, remote_addr):

def generate_refresh_token(headers, remote_addr):
	print(not isinstance(headers, EnvironHeaders),  "User-Agent" not in headers, flush=True)
	if not isinstance(headers, EnvironHeaders) or "User-Agent" not in headers:
		return None

	raw_data = headers["User-Agent"] + remote_addr + "wegoweg4384"
	hash_data = hashlib.sha256(raw_data.encode())
	return hash_data.hexdigest()

def store_refresh_token(user_id, refresh_token, expire_date):
	token_payload = {"user_id": user_id, "last_token": None, "active_token": refresh_token, "expire_date": expire_date}
	print(token_payload, flush=True)

	try:
		token_load = refresh_token_schema.load(token_payload)
		db.session.add(token_load)
		db.session.commit()
	except ValidationError as e:
		print(e, flush=True)
		return False

	return False


def generate_session_token(payload):
	private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
	return private_key, private_key.public_key()

cache_token = {}
def add_token_keys_to_cache(k, public, private):
	cache_token[k] = [public, private]

def is_refresh_token_valid(user_id, headers, remote_addr):
	data = RefreshToken.query.filter_by(user_id=user_id)

	if not data:
		return False

	print(type(data))


'''
	make a function to create a refresh token
	make a task to check refresh token expiration
	make a function to create a session token based on the refresh token
	make a function to check if the active refresh token is equal to the one the client sent
'''
