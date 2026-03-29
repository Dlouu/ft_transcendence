from flask import request
from functools import wraps
import os

from app.utils.logger import logger

def request_author_check(self):
	def decorator(f):
		@wraps(f)
		def decorated(*args, **kwargs):
			auth_header = request.headers.get("Authorization")

			if not auth_header or not auth_header.startswith("Bearer "):
				return {"message": "Unauthorized"}, 401

			token = auth_header.split(" ")[1]

			if token != os.getenv("GAME_SECRET_KEY", ""):
				logger.warning("Someone tried to access a protected endpoint without a valid key.", extra=logger.extra(request=request))
				return {"message": "Forbidden"}, 403
			return f(*args, **kwargs)
		return decorated
	return decorator
