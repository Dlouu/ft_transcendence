from flask import Blueprint, request
from app.extensions import cache_token
from app.utils.session_token import delete_session_token, generate_session_token, store_session_token, wrap_new_session_token
from app.utils.refresh_token import generate_refresh_token_rules, generate_refresh_token_from_rules, does_refresh_token_exist, generate_new_active_refresh_token

token_handler = Blueprint("token_handler", __name__)

@token_handler.route("/update", methods=["GET"])
def update_token():
	auth_header = request.headers.get("Authorization")

	if not auth_header or not auth_header.startswith("Bearer "):
		return {"message": "Missing or invalid token in the request header."}, 401

	token = auth_header.split(" ", 1)[1]

	if token not in cache_token:
		return {"message": "Missing token in the cache."}, 401

	user_id = cache_token[token][2]

	refresh_token_exist, is_last_one, tid = does_refresh_token_exist(user_id, request)
	if not refresh_token_exist and not is_last_one:
		return {"message": "No active or inactive refresh token found."}, 401
	elif is_last_one:
		generate_new_active_refresh_token(request, tid)

	delete_session_token(token)
	token, public, private = generate_session_token(user_id, request.headers, request.remote_addr)
	store_session_token(token, public, private, user_id, tid)

	response = wrap_new_session_token(token, public)
	response["message"] = "success"

	return response, 200

@token_handler.route("/test_refresh_token", methods=["GET"])
def test_refresh_token():
	rules = generate_refresh_token_rules()
	print(rules, flush=True)
	print("Generated token:", generate_refresh_token_from_rules(request, rules), flush=True)
	return {}, 200

'''
	make a function to create a refresh token
	make a task to check refresh token expiration
	make a function to create a session token based on the refresh token
	make a function to check if the active refresh token is equal to the one the client sent
'''
