from flask import Flask
from .extensions import db
import os

from .hashing import hashing
from .oauth import oauth

def create_app():
	app = Flask(__name__)
	app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
		"CREDENTIAL_DATABASE_URI",
		"mysql+mysqldb://auth_user:auth_pwd@auth_db:3306/auth_data",
	)
	app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

	db.init_app(app)

	app.register_blueprint(hashing, url_prefix='/test') #registering
	app.register_blueprint(oauth, url_prefix='/') #registering

	return app
