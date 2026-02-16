from flask import Flask, g
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

from .config import Config
from .extensions import db, ma

def	create_app():
	app = Flask(__name__)
	app.config.from_object(Config)

	db.init_app(app)
	ma.init_app(app)

	limiter = Limiter(
		app=app,
		key_func=get_remote_address,
		storage_uri="redis://redis:6379",
		default_limits=["10 per second"]
	)

	from .api import api

	api.init_app(app)

	@app.after_request
	def after_request_handler(response):
		if hasattr(g, "x_new_token"):
			response.set_cookie(
				"session_token",
				f"Bearer {g.x_new_token}",
				httponly=True,
				secure=True,
				samesite="None",
				max_age=int(os.getenv("TOKEN_CACHE_LIFETIME", "3600"))
			)
		return response

	return app
