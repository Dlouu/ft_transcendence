from jwt.exceptions import ExpiredSignatureError
from flask import request, g
from functools import wraps
import requests

from app.services import request_service as rs
from app.services import session_service as st
from app.utils.logger import logger

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
				logger.info("A client trying to access an endpoint without a bearer.", extra=logger.extra(request=request))
				return {"message": "No token provided."}, 401

			token = auth_header.split(" ", 1)[1]

			if not st.does_session_token_exist(token):
				logger.info("A client own an unknow session token.", extra=logger.extra(request=request))
				return {"message": "The token does not exist."}, 401

			try:
				payload = st.decode_session_token(token)
				g.token = token
				g.token_payload = payload
			except ExpiredSignatureError:
				response = rs.make_request("/token_handler/update", "GET")
				if response.status_code != 200:
					logger.info("The client signature expired and no new token will be generated.", extra=logger.extra(request=request, response=response, target_service="auth"))
					return response.json(), response.status_code

				g.x_new_token = response.json().get("token")
				g.token = response.json().get("token")
				g.token_payload = st.decode_session_token(g.token)
			except Exception as e:
				logger.critical(f"Undefined error happened in the jwt check.", extra=logger.extra(request=request, exception=e))
				return {"message": "Missing or invalid token."}, 401

			return f(*args, **kwargs)
		return decorated
	return decorator
