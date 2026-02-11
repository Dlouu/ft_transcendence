import jwt
from flask import Blueprint, request
from app.services import session_service as st
from app.services import session_refresh_service as srs


ns = Blueprint("TokenValidationHandler", __name__)

@ns.route("/update", methods=["GET"])
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
	session_token = request.cookies.get("session_token")
	if not session_token or not session_token.startswith("Bearer "):
		return {"message": "Missing or invalid token in the request header."}, 401

	token = session_token.split(" ", 1)[1]

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

	refresh_token_exist, is_last_one, tid = srs.does_refresh_token_exist(payload["user_id"], request)
	if not refresh_token_exist and not is_last_one:
		return {"message": "No active or inactive refresh token found."}, 401
	elif is_last_one:
		srs.generate_new_active_refresh_token(request, tid)

	st.delete_session_token(token)
	token, public, private, created_at = st.generate_session_token(payload["user_id"], tid, request.headers, request.remote_addr)
	st.store_session_token(token, public, payload["user_id"])

	response = {
		"message": "success",
		"token": token,
	}

	return response, 200
