from flask import Blueprint, request
from marshmallow import ValidationError
import os, bcrypt

from app.schemas import user as user_schema
from app.models.user import User
from app.models.refresh_tokens import RefreshToken
from app.utils import user_check as uc
from app.services import session_service as ss
from app.extensions import db

ns = Blueprint("User", __name__)

@ns.route("/update_information", methods=["POST"])
def update_information():
	"""
	Endpoint to update the user email.

	API:
		Method: POST
		Endpoint: /user/update_information

	Response:
		200: Email updated.
		400: Invalid body, values are missing or invalid.
		401: The user dont exist in the credential database.
	"""
	try:
		data = user_schema.user_update_schema.load(request.json)
	except ValidationError as e:
		return {"message": "The body is no valid."}, 400

	user = User.query.filter_by(id=data["user_id"]).first()

	if not user:
		return {"message": "The user can't be found in the auth database."}, 401

	if "username" in data and user.username != data["username"]:
		min_len = int(os.getenv("AUTH_MIN_USERNAME_LENGTH", "3"))
		max_len = int(os.getenv("AUTH_MAX_USERNAME_LENGTH", "10"))
		if not uc.is_username_valid(data["username"]):
			return {"message": f"The username is not valid, only alphanumeric, _ and - characters are allowed. Length must be between {min_len} and {max_len}"}, 400

		if uc.username_exists(data["username"]):
			return {"message": "This username already exist."}, 400

		user.username = data["username"]

	if "email" in data and user.email != data["email"]:
		if not uc.is_email_valid(data["email"]):
			db.session.rollback()
			return {"message": "The email is not valid."}, 400

		if uc.does_email_exist(data["email"]):
			db.session.rollback()
			return {"message": "This email already exist."}, 400

		user.email = data["email"]

	db.session.commit()
	return {"message": "success"}, 200

@ns.route("/update_password", methods=["POST"])
def UpdatePassword():
	"""
	Update the user password.

	API:
		Method: POST
		Endpoint: /user/update_password

	Response:
		200: Password updated.
		400: Body is not valid.
		400: The new password is not valid.
		404: The user don't exist in the credential database.
	"""
	try:
		data = user_schema.password_update_schema.load(request.json)
	except ValidationError:
		return {"message": "The body is no valid."}, 400

	user = User.query.filter_by(id=data["user_id"]).first()

	if not user:
		return {"message": f"No user found with the id {data["user_id"]}"}, 404

	if not bcrypt.checkpw(data["password"].encode("utf-8"), user.password.encode("utf-8")):
		return {"message": "The password does not match the one defined by the user."}, 401

	if not uc.is_password_valid(data["new_password"]):
		return {"message": "The new password is not valid."}, 400

	password_hash = bcrypt.hashpw(data["new_password"].encode("utf-8"), bcrypt.gensalt())

	user.password = password_hash.decode("utf-8")
	db.session.commit()

	return {"message": "success"}, 200

@ns.route("/delete_account", methods=["POST"])
def delete_account():
	"""
	Delete a user account.

	API:
		Method: POST
		Endpoint: /user/delete_account

	Response:
		200: Account have been deleted.
		400: The body isn't valid.
		401: The verification password does not match the actual password of the user.
		404: The user can't be found in the credential database.
	"""
	try:
		data = user_schema.delete_account_schema.load(request.json)
	except ValidationError:
		return {"message": "The body is no valid."}, 400

	user = User.query.filter_by(id=data["user_id"]).first()

	if not user:
		return {"message": f"No user found with the id {data["user_id"]}"}, 404

	if not bcrypt.checkpw(data["password"].encode("utf-8"), user.password.encode("utf-8")):
		return {"message": "The password does not match the one defined by the user."}, 401

	db.session.delete(user)

	tokens = RefreshToken.query.filter_by(user_id=data["user_id"]).all()

	if tokens is not None:
		for row in tokens:
			db.session.delete(row)

	db.session.commit()

	token = request.cookies.get("session_token")
	if token is not None and token.startswith("Bearer "):
		token = token.split(" ", 1)[1]
		if ss.does_session_token_exist(token):
			ss.delete_session_token(token)

	return {"message": "success"}, 200

@ns.route("/email/<user_id>", methods=["GET"])
def get_user_email(user_id):
	"""
	Return the email address of a given user_id.

	API:
		Method: GET
		Endpoint: /user/email/<user_id>

	Response:
		200: Email found and returned in the response body.
		404: No email found for the given user id.
	"""
	user = User.query.filter_by(id=user_id).first()

	if not user:
		return {"message": f"No user found with the id {user_id}"}, 404

	return {"message": "success", "email": user.email}, 200
