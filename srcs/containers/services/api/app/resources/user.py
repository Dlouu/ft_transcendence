from flask_restx import Namespace, Resource, fields
from datetime import datetime, timezone
from marshmallow import ValidationError
from flask import request, g
import requests

from app.schemas.user import user_update_schema
from app.models.user import User
from app.extensions import db
from app.services import session_service as st

ns = Namespace("User", description="User endpoints")

@ns.route("/me")
class Me(Resource):
	@ns.jwt_required()
	def get(self):
		print(request.cookies.get("session_token"), flush=True)

		payload = g.token_payload

		user = User.query.filter_by(user_id=payload["user_id"]).first()
		if not user:
			return {"message": "No user found using /me"}, 404

		updated_at = datetime.now(timezone.utc)
		user.updated_at = updated_at

		db.session.commit()

		response = {
			"message": "success",
			"user_id": user.user_id,
			"username": user.username,
			"created_at": user.created_at.timestamp(),
			"updated_at": user.updated_at.timestamp()
		}
		return response, 200

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
		try:
			response = requests.post(
				"http://auth:5055/user/update_information",
				json=request.json,
				headers=request.headers,
				cookies=request.cookies,
				timeout=5
			)
		except requests.exceptions.ConnectionError as e:
			print(f"{request.path}: Unable to communicate with the auth service to update user informations ({e})", flush=True)
			return {"message": "Service currently unavailable."}, 503
		except Exception as e:
			print(f"{request.path}: WARNING: unhandled error happened in the update_information entrypoint ({e})", flush=True)
			return {"message": "Failed to update user's data."}, 401

		try:
			json_response = response.json()
		except requests.exceptions.JSONDecodeError as e:
			print(f"{request.path}: Something went wrong while decoding the response to json, the auth service may have encountered an error and crashed.", flush=True)
			return {"message": "Something wrong while trying to update user's information."}, 400

		if response.status_code != 200:
			print(f"{request.path}: The auth service was unable to update user information: ({json_response}).", flush=True)
			return json_response, 400

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

