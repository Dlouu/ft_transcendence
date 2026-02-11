from .extensions import db
from flask import Flask
import os

from app.resources.authentification import ns as authentification_ns
from app.resources.session_token_handler import ns as token_ns
from app.resources.user import ns as user_ns
from app.schedulers.refresh_token import init_schedulers
from app.oauth import oauth

def create_app():
	app = Flask(__name__)
	app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
		"CREDENTIAL_DATABASE_URI",
		"mysql+mysqldb://auth_user:auth_pwd@auth_db:3306/auth_data",
	)
	app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

	db.init_app(app)
	init_schedulers(app)

	app.register_blueprint(authentification_ns, url_prefix="/auth")
	app.register_blueprint(token_ns, url_prefix="/token_handler")
	app.register_blueprint(user_ns, url_prefix="/user")
	app.register_blueprint(oauth, url_prefix='/')

	return app


# def hourly_task():
#     print("Running hourly task...", flush=True)
#     # your logic here

# scheduler = BackgroundScheduler()
# scheduler.add_job(hourly_task, 'interval', hours=1)
# scheduler.start()

# # Optional: shut down scheduler on exit
# import atexit
# atexit.register(lambda: scheduler.shutdown())
