from functools import wraps
from flask import request, g
import requests
from app.utils import session_token as st
from jwt.exceptions import ExpiredSignatureError

def update_session_token():
	try:
		response = requests.get(
			"http://auth:5055/token_handler/update",
			headers=request.headers,
			timeout=5
		)
		return response.json(), response.status_code
	except requests.exceptions.ConnectionError as e:
		print(f"Unable to communicate with the auth service for registration ({e})", flush=True)
		return {"message": "Service currently unavailable."}, 503
	except requests.exceptions.JSONDecodeError as e:
		return {"message": "Unable to convert the response in json, an exception might have been raised in the auth service."}, 500

def jwt_required(self):
	"""
	This decorator is used to check if the request the API received contain a session token and check for its validity, depending of the context
	this function could communicate with the auth service to generate a new session token for example.
	"""
	def decorator(f):
		@wraps(f)
		def decorated(*args, **kwargs):
			auth_header = request.cookies.get("session_token")

			if not auth_header or not auth_header.startswith("Bearer "):
				print(f"Missing header or bearer for remote address {request.remote_addr}", flush=True)
				return {"message": "Missing or invalid token."}, 401

			token = auth_header.split(" ", 1)[1]

			if not st.does_session_token_exist(token):
				print(f"No session token found for remote address {request.remote_addr}", flush=True)
				return {"message": "Missing or invalid token."}, 401

			try:
				payload = st.decode_session_token(token)
				g.token = token
				g.token_payload = payload
			except ExpiredSignatureError:
				response, code = update_session_token()
				if code != 201:
					print(f"An error occured in the auth service while generating a new session token / refresh token. Code: {code}, error: {response}", flush=True)
					return {"message": "Missing or invalid token."}, code

				g.x_new_token = response.get("token")
				g.token = response.get("token")
				g.token_payload = st.decode_session_token(g.token)
			except Exception as e:
				print(e, flush=True)
				print("Undefined exception have been raised in the jwt check, resolve this or handle this behavior.", flush=True)
				return {"message": "Missing or invalid token."}, 401

			return f(*args, **kwargs)
		return decorated
	return decorator
