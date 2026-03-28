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
			return {"message": "The body is no valid."}, 400

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


updade_profile_picture_model = reqparse.RequestParser()
updade_profile_picture_model.add_argument(
	"image",
	type=FileStorage,
	location="files",
	required=True,
	help="New profile picture."
)

@ns.route("/update_profile_picture")
class UpdateProfilePicture(Resource):
	"""
	Allow the user to change his profile picture.

	API:
		Method: POST
		Endpoint: /user/update_profile_picture
		Token: yes

	Response:
		200: Profile picture updated.
		400: Body is not valid, image is missing or invalid.
		401: A problem occured while trying to delete the old profile picture or to add the new one to the s3 bucket.
	"""
	@ns.jwt_required()
	@ns.s3_bucket_health_check()
	@ns.db_health_check()
	@ns.expect(updade_profile_picture_model)
	def post(self):
		try:
			args = updade_profile_picture_model.parse_args()
			image_file = args["image"]

			if image_file.content_type not in {"image/jpeg", "image/png"}:
				return {"message": "File format not supported."}, 400
		except Exception as e:
			logger.warning("Request validation error.", extra=logger.extra(request=request, exception=e))
			return {"message": "Content invalid or wrong type."}, 400

		image_file.stream.seek(0, 2)
		file_size = image_file.stream.tell()
		image_file.stream.seek(0)

		max_size = int(os.getenv("MAX_IMAGE_SIZE", 2097152))
		if file_size > max_size:
			max_mb = max_size / (max_size * 0.5)
			return {"message": f"The image is too big (max: {max_mb:.0f}mb)."}, 400

		user_id = g.token_payload["user_id"]
		user = User.query.filter_by(user_id=user_id).first()
		extra_logger = logger.extra(request=request, user_id=user_id, target="aws")

		if not user:
			logger.critical("The user does not exist in the user database.", extra=extra_logger)
			return {"message": f"No user found with the id {user_id}, contact an admin if the problem persist."}, 401

		if not s3s.delete_all_resources(f"profile_picture/{user_id}"):
			logger.critical("Unable to delete the old profile picture", extra=extra_logger)
			return {"message": "Unable to delete the old profile picture."}, 401

		try:
			img = Image.open(image_file.stream)

			if image_file.content_type == "image/png":
				img = img.convert("RGBA")
			else:
				img = img.convert("RGB")

			small_image = img.resize((50, 50), Image.NEAREST)
			pixelated_img = small_image.resize((100, 100), Image.NEAREST)

			output = BytesIO()
			format = "PNG" if image_file.content_type == "image/png" else "JPEG"
			pixelated_img.save(output, format=format)
			output.seek(0)

			processed_file = FileStorage(
				stream=output,
				filename=image_file.filename,
				content_type=image_file.content_type,
			)
		except Exception as e:
			print(e, flush=True)

		file_ext = image_file.filename.rsplit(".", 1)[-1]
		s3_url = f"profile_picture/{user_id}/{uuid4()}.{file_ext}"

		if not s3s.add_resource(processed_file, s3_url):
			logger.critical("Unable to upload the new profile picture", extra_logger)
			return {"message": "Unable to upload the new profile picture."}, 401

		user.profile_picture_url = s3_url
		db.session.commit()

		logger.info("User's profile picture updated.", extra=extra_logger)
		return {"message": "success"}, 200
