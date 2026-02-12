from flask import Blueprint, request
from marshmallow import ValidationError
import os, bcrypt

from app.schemas.user import user_update_schema
from app.models.user import User
from app.services.session_service import decode_session_token
from app.utils import user_check as uc
from app.extensions import db

ns = Blueprint("User", __name__)

@ns.route("/update_information", methods=["POST"])
def update_information():
	try:
		user_id = request.json.pop("user_id")
	except IndexError as e:
		return {"message": "No user id found in the request body."}, 404
	try:
		information = user_update_schema.load(request.json)
	except ValidationError as e:
		return {"message": "The body isn't valid"}, 400
	print(user_id, flush=True)
	user = User.query.filter_by(id=user_id).first()

	if not user:
		return {"message": "The user can't be found in the auth database."}, 401

	if "username" in information and user.username != information["username"]:
		min_len = int(os.getenv("AUTH_MIN_USERNAME_LENGTH", "3"))
		max_len = int(os.getenv("AUTH_MAX_USERNAME_LENGTH", 10))
		if not uc.is_username_valid(information["username"]):
			return {"message": f"The username is not valid, only alphanumeric, _ and - characters are allowed. Length must be between {min_len} and {max_len}"}, 400

		if uc.username_exists(information["username"]):
			return {"message": "This username already exist."}, 400

		user.username = information["username"]

	if "email" in information and user.email != information["email"]:
		if not uc.is_email_valid(information["email"]):
			db.session.rollback()
			return {"message": "The email is not valid."}, 400

		if uc.does_email_exist(information["email"]):
			db.session.rollback()
			return {"message": "This email already exist."}, 400

		user.email = information["email"]

	db.session.commit()
	return {"message": "success"}, 200

@ns.route("/update_password", methods=["POST"])
def UpdatePassword():
	try:
		user_id = request.json.pop("user_id")
	except IndexError:
		return {"message": "No user id found in the body."}, 404

	user = User.query.filter_by(id=user_id).first()

	if not user:
		return {"message": f"No user found with the id {user_id}"}, 404

	password = request.json.get("password")
	new_password = request.json.get("new_password")

	if not password or not new_password:
		return {"message": "Password or new password is missing."}, 404

	if not bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
		return {"message": "The password does not match the one defined by the user."}, 401

	if not uc.is_password_valid(new_password):
		return {"message": "The new password is not valid."}, 401

	password_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())

	user.password = password_hash.decode("utf-8")
	db.session.commit()

	return {"message": "success"}, 200


@ns.route("/email/<user_id>", methods=["GET"])
def get_user_email(user_id):
	user = User.query.filter_by(id=user_id).first()

	if not user:
		return {"message": f"No user found with the id {user_id}"}, 404

	return {"message": "success", "email": user.email}, 200
