from flask import Blueprint, render_template, request, redirect, jsonify
from dotenv import load_dotenv
import requests
import os
import json
import bcrypt
from sqlalchemy.exc import IntegrityError
from user import db, User, email_exists, load_user_payload

load_dotenv()

oauth = Blueprint("oauth", __name__)

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
	print(user["owner"]["login"], flush=True)
	return jsonify(user)

def check_valid_email(data):
	if data is None: data = json.load(f)
	check_email = data.get("email")
	if not check_email:
		return "blank", 430
	check_email = check_email.strip().lower()
	if " " in check_email:
		return "not one single string", 431
	if check_email.count("@") != 1:
		return "not a valid email", 432
	left, right = check_email.split("@")
	if right.count(".") != 1:
		return "not a valid email", 432
	domain, country = right.rsplit(".", 1)
	if len(left) < 3 or len(left) > 64:
		return "length not valid", 433
	for c in left:
		if not c.isalpha():
			return "Unexpected character in email", 436
	if len(domain) < 1:
		return "not a valid domain", 434
	for c in domain:
		if not c.isalpha():
			return "Unexpected character in domain", 436
	if len(country) < 2:
		return "not a valid country", 435
	for c in country:
		if not c.isalpha():
			return "Unexpected character in country", 436
	return None

# politique de mot de passe fort?

@oauth.route("/registration", methods=["POST"])
def registration():
	data = request.get_json(silent=True)
	if data is None:
		with open("test_registration.json", "r") as f:
			data = json.load(f)
	error = check_valid_email(data)
	if error is not None:
		msg, code = error
		return jsonify({"error": msg}), code
	try:
		user = load_user_payload(data)
	except ValueError as exc:
		return jsonify({"error": str(exc)}), 400
	if email_exists(user.email):
		return jsonify({"error": "email already exists"}), 409
	password = data.get("password")
	if not password:
		return jsonify({"error": "missing password"}), 400
	try:
		password_bytes = password.encode("utf-8")
		password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
		user.password = password_hash.decode("utf-8")
		db.session.add(user)
		db.session.commit()
	except IntegrityError:
		db.session.rollback()
		return jsonify({"error": "email already exists"}), 409
	except Exception as exc:
		db.session.rollback()
		return jsonify({"error": str(exc)}), 500
	return jsonify({"status": "success"}), 201

@oauth.route("/login", methods=["POST"])
def login():
	data = request.get_json(silent=True)
	if data is None:
		with open("test_registration.json", "r") as f:
			data = json.load(f)
	print("loginnnnn:",request.json, flush=True)
	return {}, 200

# definir table, class user qui herite de db.model
# chercher ce quil y a dans credentials
#definir shema pour parser ma requete -->faire une classe meta pour le link a mon modele (^^)
# try catch et verifier si les valeurs sont valides (ex: email)
