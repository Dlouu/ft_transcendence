from flask import Blueprint, request
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
import os, json, bcrypt

from app.services import session_service as st
from app.services import session_refresh_service as rt
from app.utils import user_check as uc
from app.models.user import User
from app.extensions import db

ns = Blueprint("Authentification", __name__)

@ns.route("/registration", methods=["POST"])
def registration():
	data = request.get_json(silent=True)

	if not uc.is_email_valid(data.get("email", "")):
		return {"message": "The email is not valid."}, 400

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
		return {"message": "Email already exists."}, 400
	if uc.username_exists(user.username):
		return {"message": "username already exists"}, 400

	try:
		password_bytes = password.encode("utf-8")
		password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
		user.password = password_hash.decode("utf-8")
		db.session.add(user)
		db.session.commit()
	except IntegrityError:
		db.session.rollback()
		return {"message": "email already exists"}, 401
	except Exception as exc:
		db.session.rollback()
		return {"message": str(exc)}, 500

	success, tid = rt.initialize_new_refresh_token(user.id, request)
	if not success:
		db.session.delete(user)
		db.session.commit()
		return {"message": "failure when storing refresh token"}, 401

	token, public, private, created_at = st.generate_session_token(user.id, tid, request.headers, request.remote_addr)
	st.store_session_token(token, public, user.id)

	response = {
		"message": "success",
		"id": user.id,
		"token": token
	}

	return response, 201

@ns.route("/login", methods=["POST"])
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
