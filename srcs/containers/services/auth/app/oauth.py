from flask import Blueprint, render_template, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import requests
import os
import json

load_dotenv()

oauth = Blueprint("oauth", __name__)
db = SQLAlchemy()

@oauth.route("/")
def home():
	return render_template("home.html")

@oauth.route("/oauth/42", methods=["GET"])
def oauth42():
	client_id = os.getenv("TRANSCENDANCE_ID")
	redirect_uri = os.getenv("TRANSCENDANCE_REDIRECTION")

	if not client_id or not redirect_uri:
		return "Missing OAuth configuration", 500

	auth_url = (
		"https://api.intra.42.fr/oauth/authorize"
		f"?client_id={client_id}"	
		"&response_type=code"
		f"&redirect_uri={redirect_uri}"
	)
	return redirect(auth_url)

@oauth.route("/oauth/42/callback")
def oauth42_callback():
	code = request.args.get("code")
	if not code:
		return "No code", 400 #?

	request_access_token = requests.post(
		"https://api.intra.42.fr/oauth/token",
		data = {
			"grant_type":"authorization_code",
			"client_id": os.getenv("TRANSCENDANCE_ID"),
			"client_secret": os.getenv("TRANSCENDANCE_SECRET"),
			"code": code,
			"redirect_uri": os.getenv("TRANSCENDANCE_REDIRECTION"),
		},
		timeout=10,
	)
	if request_access_token.status_code != 200:
		return "Token request failed", 502

	token_data = request_access_token.json()
	access_token = token_data.get("access_token")
	
	if not access_token:
		return "No token", 401 #?

	success_user = requests.get(
		"https://api.intra.42.fr/v2/me",
		headers={"Authorization": f"Bearer {access_token}"},
		timeout=10,
	)
	if success_user.status_code != 200:
		return "User fetch failed", 502

	user = success_user.json()
	return jsonify(user)

class Credentials(db.Model):
    __tablename__ = "credentials"

    id = db.Column(db.BigInteger, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

def email_exists(email: str) -> bool:
    return db.session.query(Credentials.id)\
        .filter(Credentials.email == email)\
        .first() is not None


@oauth.route("/registration", methods=["POST"])
def registration():
	# 3 infos du json
	data = request.get_json(silent=True)
	if data is None:
		with open("test_registration.json", "r") as f:
			data = json.load(f)
	check_email = data.get("email")
	if check_email:
		check_email = check_email.strip().lower()
	else:
		return "blank", 430

	if " " in check_email:
		return "not one single string", 431
	if check_email.count("@") != 1 or check_email.count(".") != 1 or check_email.count("@.") == 1:
		return "not a valid email", 432
	len_before = check_email.split("@")[0]
	if len(len_before) < 3 or len(len_before) > 64 :
		return "length not valid", 433
	len_after = check_email.split(".")[1]
	if len(len_after) < 2:
		return "not a valid domain", 434
	print("cheeeeeeck", check_email, flush=True)
	if email_exists(check_email):
		return "email already exists", 435
	return {}, 200


@oauth.route("/login", methods=["POST"])
def login():
	# 2 infos du json
	print("loginnnnn:",request.json, flush=True)
	return {}, 200
