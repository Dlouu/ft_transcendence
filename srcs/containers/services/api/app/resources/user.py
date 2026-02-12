from flask_restx import Namespace, Resource, fields
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
