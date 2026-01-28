from flask import Blueprint, render_template, request, redirect, jsonify
from dotenv import load_dotenv
import requests
import os
import json
import bcrypt
import string
import re
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from user import db, User, email_exists, username_exists, load_user_payload

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
		return "No code", 400

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
	username = "~" + user.get("login")
	email = user.get("email")
	if not username or not email:
		return "missing email or login from 42"

	data = {
		"username": username,
		"email": email,
		"password": "",
	}
	existing = User.query.filter(User.email == email).first()
	if existing is not None:
		return "Successful 42api login (already logged once previously)", 200
	try:
		user_payload = load_user_payload(data)
		db.session.add(user_payload)
		db.session.commit()
	except Exception as exc:
		db.session.rollback()
		return str(exc), 500
	return "Successful 42api login (first time login)"

def check_valid_username(data):
	check_username = data.get("username")
	if not check_username:
		return "blank", 430
	check_username = check_username.strip()
	if " " in check_username:
		return "not one single string", 431
	if len(check_username) < 3 or len(check_username) > 64:
		return "length not valid", 433
	for c in check_username:
		if not (c.isalnum() or c in "-_"):
			return "Only alphanumeric characters and '-' or '_' are accepted", 436
	return None

'''
8 characters minimum
At least one uppercase and one lowercase letter. At least one symbol and one digit.
'''

def check_strong_password(str):
	if len(str) < int(os.getenv("AUTH_MIN_PASS_LENGTH")) or len(str) > int(os.getenv("AUTH_MAX_PASS_LENGTH")):
		return "not a valid length", 440
	has_upper = False
	has_lower = False
	has_symbol = False
	has_digit = False

	for c in str:
		if c.isupper():
			has_upper = True
		elif c.islower():
			has_lower = True
		elif c.isdigit():
			has_digit = True
		elif c in string.punctuation:
			has_symbol = True

	if not has_upper:
		return "missing one uppercase character", 1
	if not has_lower:
		return "missing one lowercase character", 2
	if not has_digit:
		return "missing one digit", 3
	if not has_symbol:
		return "missing one special character", 4
	return None

@oauth.route("/registration", methods=["POST"])
def registration():
	data = request.get_json(silent=True)
	if data is None:
		with open("test_registration.json", "r") as f:
			data = json.load(f)
	regex = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}"
	if not re.fullmatch(regex, data.get("email")):
		return jsonify({"error": "invalid email"}), 409
	error = check_valid_username(data)
	if error is not None:
		msg, code = error
		return jsonify({"error": msg}), code
	try:
		user = load_user_payload(data)
	except ValueError as exc:
		return jsonify({"error": str(exc)}), 400
	if email_exists(user.email):
		return jsonify({"error": "email already exists"}), 409
	if username_exists(user.username):
		return jsonify({"error": "username already exists"}), 410
	password = data.get("password")
	if not password:
		return jsonify({"error": "missing password"}), 400
	error = check_strong_password(password)
	if error:
		msg, code = error
		return jsonify({"error": msg}), 400
	#if password != data.get("second_password"): # double password verification
		#return "both passwords mismatch", 411
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
	return jsonify({"status": "success", "id": user.id}), 201

@oauth.route("/login", methods=["POST"])
def login():
	data = request.get_json(silent=True)
	if data is None:
		with open("test_login.json", "r") as f:
			data = json.load(f)
	username_or_login = data.get("email") or data.get("username")
	password = data.get("password")
	if not username_or_login and password:
		return "infobulle: nothing given", 438
	user = User.query.filter(or_(User.email == username_or_login, User.username == username_or_login)).first()
	if user is None:
		return "login/user and password mismatch", 439
	try:
		password_bytes = password.encode("utf-8")
		password_hash = user.password.encode("utf-8")
		if not bcrypt.checkpw(password_bytes, password_hash):
			return "login/user and password mismatch", 439
	except ValueError as exc:
		return jsonify({"error": str(exc)}), 400
	return jsonify({"status": "success", "id": user.id}), 201
