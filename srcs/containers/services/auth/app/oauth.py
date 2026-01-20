from flask import Blueprint, render_template, request, redirect
from dotenv import load_dotenv
import os

load_dotenv()

oauth = Blueprint("oauth", __name__)

@oauth.route("/")
def home():
	return render_template("home.html")

@oauth.route("/oauth/42", methods=["GET"])
def oauth42():
	client_id = os.getenv("TRANSCENDANCE_ID")
	redirect_uri = os.getenv("TRANSCENDANCE_REDIRECTION")

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
		}
	)
	token_data = request_access_token.json()
	access_token = token_data.get("access_token")
	
	if not access_token:
		return "No token", 401 #?

	success_user = requests.get(
		"https://api.intra.42.fr/v2/me",
		headers={"Authorization": f"Bearer {access_token}"}
	)
	user = success_user.json()
	print(user)

	return redirect("/")


@oauth.route("/registration", methods=["POST"])
def registration():
	print("registerrrrr:", request.json, flush=True)
	return {}, 200


@oauth.route("/login", methods=["POST"])
def login():
	print("loginnnnn:",request.json, flush=True)
	return {}, 200
