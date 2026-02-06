import jwt
from flask import Blueprint, request
from app.utils import session_token as st
from app.utils.refresh_token import generate_refresh_token_rules, generate_refresh_token_from_rules, does_refresh_token_exist, generate_new_active_refresh_token


token_handler = Blueprint("token_handler", __name__)

@token_handler.route("/update", methods=["GET"])
def update_token():
	auth_header = request.headers.get("Authorization")

	if not auth_header or not auth_header.startswith("Bearer "):
		return {"message": "Missing or invalid token in the request header."}, 401

	token = auth_header.split(" ", 1)[1]

	if not st.does_session_token_exist(token):
		return {"message": "Missing token in the cache."}, 401

	payload = None
	try:
		payload = st.decode_session_token(token)
		if not payload:
			return {"message": "A problem occured while decoding the token."}, 401
	except jwt.exceptions.ExpiredSignatureError as e:
		payload = st.get_token_associated_data(token)
	except Exception as e:
		print(f"Unhandled error happened while trying to decode the user token ({e})", flush=True)
		return {"message": "Failed to decode the token / unhandled error."}, 500

	refresh_token_exist, is_last_one, tid = does_refresh_token_exist(payload["user_id"], request)
	if not refresh_token_exist and not is_last_one:
		return {"message": "No active or inactive refresh token found."}, 401
	elif is_last_one:
		generate_new_active_refresh_token(request, tid)

	st.delete_session_token(token)
	token, public, private = st.generate_session_token(payload["user_id"], tid, request.headers, request.remote_addr)
	st.store_session_token(token, public, payload["user_id"])

	response = st.wrap_new_session_token(token, public)
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
