import jwt
from flask import Blueprint, request
from app.utils import session_token as st
from app.utils.refresh_token import generate_refresh_token_rules, generate_refresh_token_from_rules, does_refresh_token_exist, generate_new_active_refresh_token


token_handler = Blueprint("token_handler", __name__)

@token_handler.route("/update", methods=["GET"])
def update_token():
	"""
	This endpoint is used to create a new session token for a user, it check whether the user's session has its
	refresh token, if not then we dont regenerate a session token, if it has been found but it dont have an active
	refresh token anymore then we regenerate a new one before making a new session token.

	API:
		Method: GET
		Endpoint: /token_handler/update
		Token: no

	Response:
		201: A new session token have been created.
		401: If the user's request does not meet a requirement.
		500: An error occured during the process.
	"""
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

	return response, 201
