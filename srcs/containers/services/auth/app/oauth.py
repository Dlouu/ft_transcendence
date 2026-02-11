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
