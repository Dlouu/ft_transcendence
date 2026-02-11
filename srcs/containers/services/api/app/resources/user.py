from flask_restx import Namespace, Resource, fields
from datetime import datetime, timezone
from marshmallow import ValidationError
from flask import request, g

from app.schemas.user import user_update_schema
from app.models.user import User
from app.extensions import db
from app.services import request_service as rs
from app.services import me_service as ms

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
			information = user_update_schema.load(request.json)
		except ValidationError:
			return {"message": "The body isn't valid."}, 400

		payload = g.token_payload
		request.json["payload"] = payload

		response = rs.make_request("http://auth:5055/user/update_information", "POST")
		if response.status_code != 200:
			print(f"{request.path}: The auth service was unable to update user information.", flush=True)
			return response.json(), response.status_code

		user = User.query.filter_by(user_id=payload["user_id"]).first()

		if not user:
			print(f"{request.path}: The user {payload["user_id"]} does not exist in the database, this isn't a normal error.", flush=True)
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
	def post(self):
		pass
