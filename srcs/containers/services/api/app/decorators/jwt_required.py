from functools import wraps
from flask import request, g
from flask_restx import Namespace
import jwt
import requests
from app.utils.jwt_storage_manipulation import add_token, delete_token, is_token_stored, decode_token
from jwt.exceptions import ExpiredSignatureError, DecodeError, InvalidSignatureError

def update_session_token():
	response = requests.get(
		"http://auth:5001/token_handler/update",
		json=request.json,
		headers=request.headers,
		timeout=5
	)
	try:
		return response.json(), response.status_code
	except requests.exceptions.JSONDecodeError as e:
		return {}, 404

def jwt_required(self):
	def decorator(f):
		@wraps(f)
		def decorated(*args, **kwargs):
			auth_header = request.headers.get("Authorization")

			if not auth_header or not auth_header.startswith("Bearer "):
				return {"message": "Missing or invalid token."}, 401

			token = auth_header.split(" ", 1)[1]

			if not is_token_stored(token):
				return {"message": "Missing or invalid token."}, 401

			try:
				decoded = decode_token(token)
			except ExpiredSignatureError:
				response, code = update_session_token()
				delete_token(token)
				add_token(response.get("token"), response.get("public"))
				g.x_new_token = response.get("token")
				return f(*args, **kwargs)
			except Exception as e:
				print(e, flush=True)
				print("Undefined exception have been raised in the jwt check, resolve this or handle this behavior.", flush=True)

			return f(*args, **kwargs)
		return decorated
	return decorator
