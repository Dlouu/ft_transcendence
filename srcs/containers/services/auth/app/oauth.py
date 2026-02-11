from flask import Blueprint, render_template, request, redirect, jsonify
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from sqlalchemy import or_
import requests, os, json, bcrypt

from app.services import session_service as st
from app.services import session_refresh_service as rt
from app.utils import user_check as uc
from app.models.user import User
from .extensions import db

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
		return {"message": "Token request failed"}, 502

	token_data = request_access_token.json()
	access_token = token_data.get("access_token")

	if not access_token:
		return {"message": "No token"}, 401 #? #??

	success_user = requests.get(
		"https://api.intra.42.fr/v2/me",
		headers={"Authorization": f"Bearer {access_token}"},
		timeout=10,
	)
	if success_user.status_code != 200:
		return {"message": "User fetch failed"}, 502

	user = success_user.json()
	username = "~" + user.get("login")
	email = user.get("email")
	if not username or not email:
		return {"message": "missing email or login from 42"}, 400

	data = {
		"username": username,
		"email": email,
		"password": "",
	}
	existing = User.query.filter(User.email == email).first()
	if existing is not None:
		return {"message": "Successful 42api login (already logged once previously)"}, 200
	try:
		user_payload = uc.load_user_payload(data)
		db.session.add(user_payload)
		db.session.commit()
	except Exception as exc:
		db.session.rollback()
		return str(exc), 500
	return {"message": "Successful 42api login (first time login)."}

@oauth.route("/registration", methods=["POST"])
def registration():
	data = request.get_json(silent=True)

	if not uc.is_email_valid(data.get("email", "")):
		return {"message": "The email is not valid."}, 409

	min_len = int(os.getenv("AUTH_MIN_USERNAME_LENGTH", "3"))
	max_len = int(os.getenv("AUTH_MAX_USERNAME_LENGTH", 10))
	if not uc.is_username_valid(data.get("username", "")):
		return {"message": f"The username is not valid, only alphanumeric, _ and - characters are allowed. Length must be between {min_len} and {max_len}"}, 400

	min_len = int(os.getenv("AUTH_MIN_PASS_LENGTH"))
	max_len = int(os.getenv("AUTH_MAX_PASS_LENGTH"))
	password = data.get("password") or ""
	if not uc.is_password_valid(password):
		return {"message": f"Password is not valid, it must have at least one upper character, one lower, one digit, one special character and a length  between {min_len} and {max_len}"}, 400

	try:
		user = uc.load_user_payload(data)
	except ValueError as exc:
		return {"message": str(exc)}, 400

	if uc.does_email_exist(user.email):
		return {"message": "Email already exists."}, 409
	if uc.username_exists(user.username):
		return {"message": "username already exists"}, 410

	try:
		password_bytes = password.encode("utf-8")
		password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
		user.password = password_hash.decode("utf-8")
		db.session.add(user)
		db.session.commit()
	except IntegrityError:
		db.session.rollback()
		return {"message": "email already exists"}, 409
	except Exception as exc:
		db.session.rollback()
		return {"message": str(exc)}, 500

	success, tid = rt.initialize_new_refresh_token(user.id, request)
	if not success:
		db.session.delete(user)
		db.session.commit()
		return {"message": "failure when storing refresh token"}, 500

	token, public, private, created_at = st.generate_session_token(user.id, tid, request.headers, request.remote_addr)
	st.store_session_token(token, public, user.id)

	response = {
		"message": "success",
		"id": user.id,
		"token": token
	}

	return response, 201

@oauth.route("/login", methods=["POST"])
def login():
	data = request.get_json(silent=True)
	if data is None:
		with open("test_login.json", "r") as f:
			data = json.load(f)
	username_or_login = data.get("login_email")
	password = data.get("password")
	if not username_or_login or not password:
		return {"message": f"Username/Email or password is missing."}, 400
	user = User.query.filter(or_(User.email == username_or_login, User.username == username_or_login)).first()
	if user is None:
		return {"message": "Username/Email and password does not match."}, 400

	try:
		password_bytes = password.encode("utf-8")
		password_hash = user.password.encode("utf-8")
		if not bcrypt.checkpw(password_bytes, password_hash):
			return {"message": "Username/Email and password does not match."}, 400
	except ValueError as exc:
		return {"message": "Something wrong happened when trying to login the user, if the problem persist contact an admin."}, 400

	refresh_token_exist, is_last_one, tid = rt.does_refresh_token_exist(user.id, request)

	if not refresh_token_exist and not is_last_one:
		rt.initialize_new_refresh_token(user.id, request)
	elif is_last_one:
		rt.generate_new_active_refresh_token(request, tid)

	token, public, private, created_at = st.generate_session_token(user.id, tid, request.headers, request.remote_addr)
	st.store_session_token(token, public, user.id)

	response = {
		"message": "success",
		"id": user.id,
		"token": token
	}

	return response, 200
