from flask import Flask
from .config import Config
from .extensions import db, ma
from .api import api

def	create_app():
	app = Flask(__name__)
	app.config.from_object(Config)

	db.init_app(app)
	ma.init_app(app)
	api.init_app(app)

	return app

