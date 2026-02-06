from functools import wraps
from flask import request, g
import requests
from app.utils import session_token as st
from jwt.exceptions import ExpiredSignatureError

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
				print(f"Missing header or bearer for remote address {request.remote_addr}", flush=True)
				return {"message": "Missing or invalid token."}, 401

			token = auth_header.split(" ", 1)[1]

			if not st.does_session_token_exist(token):
				print(f"No session token found for remote address {request.remote_addr}", flush=True)
				return {"message": "Missing or invalid token."}, 401

			try:
				payload = st.decode_session_token(token)
				print(payload, flush=True)
			except ExpiredSignatureError:
				response, code = update_session_token()

				if code != 200:
					print(f"An error occured in the auth service while generating a new session token / refresh token. Code: {code}, error: {response}", flush=True)
					return {"message": "Missing or invalid token."}, code

				g.x_new_token = response.get("token")
			except Exception as e:
				print(e, flush=True)
				print("Undefined exception have been raised in the jwt check, resolve this or handle this behavior.", flush=True)
				return {"message": "Missing or invalid token."}, 401

			return f(*args, **kwargs)
		return decorated
	return decorator
