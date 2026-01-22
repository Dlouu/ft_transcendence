from flask import Blueprint, render_template, request, redirect, jsonify
from dotenv import load_dotenv
import requests
import os
import json
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
	return jsonify(user)

#

@oauth.route("/registration", methods=["POST"])
def registration():
	# 3 infos du json
	data = request.get_json(silent=True)
	if data is None:
		with open("test_registration.json", "r") as f:
			data = json.load(f)
	try:
		user = load_user_payload(data)
	except ValueError as exc:
		return jsonify({"error": str(exc)}), 400
	print("cheeeeeeck", user.email, flush=True)
	if email_exists(user.email):
		return "email already exists", 435
	try:
		db.session.add(user)
		db.session.commit()
	except Exception as exc:
		db.session.rollback()
		return jsonify({"error": str(exc)}), 500
	return {}, 201


@oauth.route("/login", methods=["POST"])
def login():
	# 2 infos du json
	print("loginnnnn:",request.json, flush=True)
	return {}, 200

# definir table, class user qui herite de db.model
# chercher ce quil y a dans credentials
#definir shema pour parser ma requete -->faire une classe meta pour le link a mon modele (^^)
# try catch et verifier si les valeurs sont valides (ex: email)
