from flask import Flask, g
from .config import Config
from .extensions import db, ma

def	create_app():
	app = Flask(__name__)
	app.config.from_object(Config)

	db.init_app(app)
	ma.init_app(app)

	from .api import api

	api.init_app(app)

	@app.after_request
	def after_request_handler(response):
		if hasattr(g, "x_new_token"):
			response.headers['x_new_token'] = f"Bearer {g.x_new_token}"
		return response

	return app
