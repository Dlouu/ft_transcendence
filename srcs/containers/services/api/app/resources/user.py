from flask_restx import Namespace, Resource, fields, reqparse
from werkzeug.datastructures import FileStorage
from datetime import datetime, timezone
from marshmallow import ValidationError
from sqlalchemy.orm import joinedload
from flask import request, g
from uuid import uuid4
import os

from app.schemas.card_gallery import card_gallery_schema
from app.services import s3_bucket_service as s3s
from app.models.card_gallery import CardGallery
from app.services import request_service as rs
from app.services import me_service as ms
from app.schemas import user as su
from app.models.user import User
from app.extensions import db

ns = Namespace("User", description="User endpoints")

@ns.route("/me")
class Me(Resource):
	@ns.jwt_required()
	def get(self):
		print(request.cookies.get("session_token"), flush=True)

		payload = g.token_payload

		return ms.me(payload["user_id"])

update_information_model = ns.model("UpdateInformationModel", {
	"username": fields.String(required=False),
	"email": fields.String(required=False)
})

@ns.route("/update_information")
class UpdateInformation(Resource):
	@ns.jwt_required()
	@ns.expect(update_information_model)
	def post(self):
		try:
			information = su.user_update_schema.load(request.json)
		except ValidationError:
			return {"message": "The body is no valid."}, 400

		user_id = g.token_payload["user_id"]
		request.json["user_id"] = user_id

		response = rs.make_request("/user/update_information", "POST")
		if response.status_code != 200:
			print(f"{request.path}: The auth service was unable to update user information.", flush=True)
			return response.json(), response.status_code

		user = User.query.filter_by(user_id=user_id).first()

		if not user:
			print(f"{request.path}: The user {user_id} does not exist in the database, this isn't a normal error.", flush=True)
			return {"message": "Something wrong while trying to update user's information."}, 400

		if "username" in information and user.username != information["username"]:
			user.username = information["username"]

		updated_at = datetime.now(timezone.utc)
		user.updated_at = updated_at

		db.session.commit()

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
	@ns.jwt_required()
	@ns.expect(updade_profile_picture_model)
	@ns.s3_bucket_health_check()
	def post(self):
		try:
			args = updade_profile_picture_model.parse_args()
			image_file = args["image"]

			if image_file.content_type not in {"image/jpeg", "image/png"}:
				return {"message": "File format not supported."}, 400
		except Exception as e:
			print(f"{request.path}: A problem occured while parsing data: {e}", flush=True)

		user_id = g.token_payload["user_id"]

		user = User.query.filter_by(user_id=user_id).first()

		if not user:
			return {"message": f"No user found with the id {user_id}, contact an admin if the problem persist."}, 401

		if not s3s.delete_all_resources(f"profile_picture/{user_id}/ffsfsf"):
			return {"message": "Unable to delete the old profile picture."}, 400

		file_ext = image_file.filename.rsplit(".", 1)[-1]
		s3_url = f"profile_picture/{user_id}/{uuid4()}.{file_ext}"

		if not s3s.add_resource(image_file, s3_url):
			return {"message": "Unable to upload the new profile picture."}, 400

		user.profile_picture_url = s3_url
		db.session.commit()

		return {"message": "success"}, 200


update_password_model = ns.model("UpdatePasswordModel", {
	"password": fields.String(required=True),
	"new_password": fields.String(required=True)
})

@ns.route("/update_password")
class UpdatePassword(Resource):
	@ns.jwt_required()
	@ns.expect(update_password_model)
	def post(self):
		try:
			information = su.password_update_schema.load(request.json)
		except ValidationError:
			return {"message": "The body is no valid."}, 400

		user_id = g.token_payload["user_id"]
		request.json["user_id"] = user_id

		response = rs.make_request("/user/update_password", "POST")
		if response.status_code != 200:
			print(f"{request.path}: The auth service was unable to update the user's password.", flush=True)
			return response.json(), response.status_code

		return {"message": "success"}, 200

delete_account_model = ns.model("DeleteAccountModel", {
	"password": fields.String(required=True)
})

@ns.route("/delete_account")
class DeleteAccount(Resource):
	@ns.jwt_required()
	@ns.expect(delete_account_model)
	def post(self):
		try:
			su.delete_account_schema.load(request.json)
		except ValidationError:
			return {"message": "The body is no valid."}, 400

		user_id = g.token_payload["user_id"]
		request.json["user_id"] = user_id

		response = rs.make_request("/user/delete_account", "POST")
		if response.status_code != 200:
			print(f"{request.path}: The auth service was unable to delete the user's account.", flush=True)
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

		return {"message": "success"}, 200

upload_model = reqparse.RequestParser()
upload_model.add_argument(
	"image",
	type=FileStorage,
	location="files",
	required=True,
	help="Image to upload."
)

@ns.route("/upload_card_image")
class UploadCardImage(Resource):
	@ns.jwt_required()
	@ns.expect(upload_model)
	@ns.s3_bucket_health_check()
	def post(self):
		try:
			args = upload_model.parse_args()
			image_file = args["image"]

			if image_file.content_type not in {"image/jpeg", "image/png"}:
				return {"message": "File format not supported."}, 400
		except Exception as e:
			print(f"A problem occured while parsing data ({e})", flush=True)
			return {"message": "Bad request"}, 400

		user_id = g.token_payload["user_id"]

		file_ext = image_file.filename.rsplit(".", 1)[-1]
		s3_url = f"card_gallery/{user_id}/{uuid4()}.{file_ext}"

		try:
			image_db_obj = card_gallery_schema.load({"user_id": user_id, "img_url": s3_url})
			db.session.add(image_db_obj)
		except ValidationError as e:
			db.session.rollback()
			print(f"Something wrong happened while creating image database's object for user id {user_id} ({g.token}), the image '{image_file.filename}' will not be uploaded.", flush=True)
			return {"message": "Failure, something wrong happened while uploading this image."}, 400
		except Exception as e:
			db.session.rollback()
			print(f"Unhandled error happened while creating image database's object for user id {user_id} ({g.token}), handle this error as soons as possible ({e}).", flush=True)
			return {"message": "Failure, something wrong happened while uploading this image."}, 400

		if not s3s.add_resource(image_file, s3_url):
			db.session.rollback()
			return {"message": "Failed to upload the image"}, 400

		db.session.commit()
		return {"message": "success"}, 201

remove_card_image_model = ns.model("RemoveCardImageModel", {
	"card_id": fields.Integer(required=True)
})

@ns.route("/remove_card_image")
class RemoveCardImage(Resource):
	@ns.jwt_required()
	@ns.expect(remove_card_image_model)
	@ns.s3_bucket_health_check()
	def post(self):
		try:
			data = su.delete_card_image_schema.load(request.json)
		except ValidationError:
			return {"message": "The body is not valid."}, 400

		user_id = g.token_payload["user_id"]
		card = CardGallery.query.filter_by(user_id=user_id, id=data["card_id"]).first()

		if not card:
			return {"message": f"No card found with the id {data["card_id"]} for the user id {user_id}."}, 404

		s3s.delete_resource(card.img_url)
		db.session.delete(card)
		db.session.commit()

		return {"message": "success"}, 200

@ns.route("/<user_id>/get_card_images")
class GetCardImage(Resource):
	@ns.jwt_required()
	def get(self, user_id):

		query = CardGallery.query.filter_by(user_id=user_id)

		if query.first() is None:
			return {"message": "No card image found for this user id "}, 404

		images_url = []
		for row in query.yield_per(50):
			url = s3s.get_resource_url(row.img_url, 3600)
			if url is not None:
				images_url.append({"url": url, "image_id": row.id})

		return {"message": "success", "images_url": images_url}, 200
