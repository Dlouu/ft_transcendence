from flask_restx import Namespace, Resource, fields, reqparse
from werkzeug.datastructures import FileStorage
from datetime import datetime, timezone
from marshmallow import ValidationError
from sqlalchemy.orm import joinedload
from flask import request, g
from uuid import uuid4
from PIL import Image
from io import BytesIO
import os

from app.schemas.card_gallery import card_gallery_schema
from app.services import s3_bucket_service as s3s
from app.models.card_gallery import CardGallery
from app.services import request_service as rs
from app.services import me_service as ms
from app.utils.logger import logger
from app.utils.image_mask import mask
from app.schemas import user as su
from app.models.user import User
from app.extensions import db

ns = Namespace("User", description="User endpoints")

@ns.route("/me", defaults={"user_id": None})
@ns.route("/me/<user_id>")
class Me(Resource):
	"""
	Return usefull information about the user

	API:
		Method: GET
		Endpoint: /user/me
		Token: yes

	Response:
		200: Data can be send to the user.
	"""
	@ns.jwt_required()
	@ns.db_health_check()
	def get(self, user_id):
		payload = g.token_payload

		if user_id is None:
			return ms.me(payload["user_id"])
		return ms.me(user_id, email="")

update_information_model = ns.model("UpdateInformationModel", {
	"username": fields.String(required=False),
	"email": fields.String(required=False)
})

@ns.route("/update_information")
class UpdateInformation(Resource):
	"""
	General endpoint used to update user's informations like the username or the email.

	API:
		Method: POST
		Endpoint: /user/update_information
		Token: yes

	Response:
		200: User's informations updated.
		400: Invalid body, values are missing or invalid.
		401: The user dont exist in the user database, the credential database or the token is not valid.
	"""
	@ns.jwt_required()
	@ns.db_health_check()
	@ns.expect(update_information_model)
	def post(self):
		try:
			information = su.user_update_schema.load(request.json)
		except ValidationError:
			logger.warning("Request validation error.", extra=logger.extra(request=request))
			return {"message": "The body is not valid."}, 400

		user_id = g.token_payload["user_id"]
		request.json["user_id"] = user_id

		response = rs.make_request("/user/update_information", "POST")
		extra_logger = logger.extra(request=request, response=response, user_id=user_id)
		if response.status_code != 200:
			logger.warning("server refused, unable to update user's information in the auth service.",
				  extra=extra_logger | logger.extra(target="auth"))
			return response.json(), response.status_code

		user = User.query.filter_by(user_id=user_id).first()

		if not user:
			logger.critical("The user does not exist in the user database.", extra=extra_logger)
			return {"message": "Something wrong happened while trying to update user's information."}, 401

		if "username" in information and user.username != information["username"]:
			user.username = information["username"]

		updated_at = datetime.now(timezone.utc)
		user.updated_at = updated_at

		db.session.commit()

		logger.info("User information updated.", extra=extra_logger)
		return {"message": "success"}, 200

update_password_model = ns.model("UpdatePasswordModel", {
	"password": fields.String(required=True),
	"new_password": fields.String(required=True)
})

@ns.route("/update_password")
class UpdatePassword(Resource):
	"""
	Allow the user to update his password, he have to send the last one too to validate this action.

	API:
		Method: POST
		Endpoint: /user/update_password
		Token: yes

	Response:
		200: Password updated.
		400: Body is not valid.
	"""
	@ns.jwt_required()
	@ns.expect(update_password_model)
	def post(self):
		try:
			information = su.password_update_schema.load(request.json)
		except ValidationError:
			logger.warning("Request validation error.", extra=logger.extra(request=request))
			return {"message": "The body is no valid."}, 400

		user_id = g.token_payload["user_id"]
		request.json["user_id"] = user_id

		response = rs.make_request("/user/update_password", "POST")
		if response.status_code != 200:
			logger.warning("server refused, unable to update the user's password.", extra=logger.extra(request=request, response=response, target="auth"))
			return response.json(), response.status_code

		logger.info("User's password updated.", extra=logger.extra(request=request, user_id=user_id))
		return {"message": "success"}, 200

delete_account_model = ns.model("DeleteAccountModel", {
	"password": fields.String(required=True)
})

@ns.route("/delete_account")
class DeleteAccount(Resource):
	"""
	This route is used by the user to delete his account.

	API:
		Method: POST
		Endpoint: /user/delete_account
		Token: yes

	Response:
		200: Account have been deleted.
		400: The body isn't valid.

	"""
	@ns.jwt_required()
	@ns.db_health_check()
	@ns.expect(delete_account_model)
	def post(self):
		try:
			su.delete_account_schema.load(request.json)
		except ValidationError:
			logger.warning("Request validation error.", extra=logger.extra(request=request))
			return {"message": "The body is no valid."}, 400

		user_id = g.token_payload["user_id"]
		request.json["user_id"] = user_id

		response = rs.make_request("/user/delete_account", "POST")
		if response.status_code != 200:
			logger.warning("Server refused, unable to delete the user's account.", extra=logger.extra(request=request, response=response))
			return response.json(), response.status_code

		user = User.query.options(joinedload(User.cards)).filter_by(user_id=user_id).first()

		if user is not None:
			deleted_username = str(uuid4()).split("-", 1)[0]
			while User.query.filter_by(username=deleted_username).first() is not None:
				deleted_username = str(uuid4()).split("-", 1)[0]

			user.username = "deleted_user_" + str(deleted_username)
			user.profile_picture_url = os.getenv("DEFAULT_IMG_PATH") + "/" + os.getenv("DEFAULT_PROFILE_PICTURE", "")

			s3s.delete_all_resources(f"card_gallery/{user_id}/")
			s3s.delete_all_resources(f"profile_picture/{user_id}/")

			for row in user.cards:
				db.session.delete(row)

			db.session.commit()

		logger.info("User's account deleted.", extra=logger.extra(request=request, user_id=user_id))
		return {"message": "success"}, 200
