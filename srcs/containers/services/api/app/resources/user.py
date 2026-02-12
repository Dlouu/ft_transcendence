from flask_restx import Namespace, Resource, fields, reqparse
from werkzeug.datastructures import FileStorage
from datetime import datetime, timezone
from marshmallow import ValidationError
from sqlalchemy.orm import joinedload
from flask import request, g
from uuid import uuid4
import os

from app.services import request_service as rs
from app.services import me_service as ms
from app.schemas import user as su
from app.extensions import db, s3
from app.models.user import User

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
			return {"message": "The body isn't valid."}, 400

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

		file_ext = image_file.filename.rsplit(".", 1)[-1]
		s3_url = f"profile_picture/{user_id}/{uuid4()}.{file_ext}"

		try:
			s3.upload_fileobj(image_file, os.getenv("S3_BUCKET_NAME", ""), s3_url, ExtraArgs={"ContentType": image_file.content_type})
		except Exception as e:
			print(f"{request.path}: Something wrong happened while uploadign the profile picture to the s3 bucket for user id {user_id}. ({e})", flush=True)
			return {"message": "Failed to upload the user's profile picture."}, 400

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
			return {"message": "The body isn't valid."}, 400

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
			return {"message": "The body isn't valid."}, 400

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

			for row in user.cards:
				try:
					s3.delete_object(Bucket=os.getenv("S3_BUCKET_NAME", ""), Key=row.img_url)
				except Exception as e:
					print(f"{request.path}: Unhandled error happened: {e}")

		db.session.commit()

		return {"message": "success"}, 200
