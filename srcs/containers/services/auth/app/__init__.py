from flask import Flask, Blueprint
from .extensions import db
import os

from app.decorators.db_health_check import db_health_check
Blueprint.db_health_check = db_health_check

from app.decorators.redis_health_check import redis_health_check
Blueprint.redis_health_check = redis_health_check

from app.resources.authentification import ns as authentification_ns
from app.resources.session_token_handler import ns as token_ns
from app.resources.user import ns as user_ns
from app.schedulers.refresh_token import init_schedulers
from app.oauth import oauth

def create_app():
	app = Flask(__name__)
	app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
		"CREDENTIAL_DATABASE_URI", "")
	app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

	app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
		"pool_pre_ping": True,
		"pool_recycle": 280,
		"connect_args": {
			"connect_timeout": int(os.getenv("DB_CONNECT_TIMEOUT"))
		}
	}

	db.init_app(app)
	init_schedulers(app)

	app.register_blueprint(authentification_ns, url_prefix="/auth")
	app.register_blueprint(token_ns, url_prefix="/token_handler")
	app.register_blueprint(user_ns, url_prefix="/user")
	app.register_blueprint(oauth, url_prefix='/')

	return app
