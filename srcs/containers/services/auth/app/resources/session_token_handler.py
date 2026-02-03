from flask import Blueprint, request
from app.extensions import cache_token
from app.utils.tokens_manipulation import is_refresh_token_valid, delete_session_token, generate_session_token, store_session_token, wrap_new_session_token
from app.utils.refresh_token_rules import generate_refresh_token_rules, generate_refresh_token_from_rules

token_handler = Blueprint("token_handler", __name__)

@token_handler.route("/update", methods=["GET"])
def update_token():
	auth_header = request.headers.get("Authorization")

	if not auth_header or not auth_header.startswith("Bearer "):
		return {"message": "Missing or invalid token"}, 401

	token = auth_header.split(" ", 1)[1]

	if token not in cache_token:
		return {"message": "Invalid token."}, 401

	user_id = cache_token[token][2]
	if not is_refresh_token_valid(user_id, request.headers, request.remote_addr):
		return {"message": "Refresh token expired."}, 401

	delete_session_token(token)
	token, public, private = generate_session_token(user_id, request.headers, request.remote_addr)
	store_session_token(token, public, private, user_id)

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
