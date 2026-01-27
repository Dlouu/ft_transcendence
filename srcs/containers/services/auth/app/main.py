from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from hashing import hashing
from oauth import oauth, db

load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
	"CREDENTIAL_DATABASE_URI",
	"mysql+mysqldb://auth_user:auth_pwd@auth_db:3306/auth_data",
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)
app.register_blueprint(hashing, url_prefix='/tesy') #registering
app.register_blueprint(oauth, url_prefix='/') #registering
if __name__ == "__main__":
    # Avoid double-process reloader so Ctrl+C exits once and logs are consistent.
    app.run(debug=True, port=5001, use_reloader=True, host='0.0.0.0')
