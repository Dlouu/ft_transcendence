from flask_restx import Namespace, Resource, fields
from flask import request, g
from app.models.user import User
from app.extensions import db
from app.schemas.user import user_login_schema, user_schema, user_update_schema
from app.utils import session_token as st
from marshmallow import ValidationError
from datetime import datetime, timezone
import requests
import jwt

ns = Namespace("users", description="User operations")

user_model = ns.model("User", {
	"username": fields.String(required=False)
})

user_login_model = ns.model("UserLogin", {
	"email": fields.String(required=True),
	"username": fields.String(required=True),
	"password": fields.String(required=True),
})

@ns.route("/registration")
class UserRegistration(Resource):
	@ns.expect(user_login_model)
	def post(self):
		auth_data = None
		try:
			auth_data = user_login_schema.load(request.json)
		except ValidationError as err:
			return {"message": err.messages}, 400

		try:
			response = requests.post(
				"http://auth:5055/registration",
				json=request.json,
				headers=request.headers,
				timeout=5
			)

			json_response = response.json()
		except requests.exceptions.JSONDecodeError as e:
			return {"message": "Failed to create the account."}, 401
		except requests.exceptions.ConnectionError as e:
			print(f"Unable to communicate with the auth service for registration ({e})", flush=True)
			return {"message": "Service currently unavailable."}, 503
		except Exception as e:
			print(f"WARNING: unhandled error happened in the registration entrypoint ({e})", flush=True)
			return {"message": "Failed to create the account."}, 401

		if (response.status_code != 201):
			return json_response, response.status_code

		try:
			user_payload = {"username": auth_data["username"], "user_id": json_response["id"]}
			user = user_schema.load(user_payload)
			db.session.add(user)
			db.session.commit()
		except Exception as e:
			print(e, flush=True)
			return {"message": "Error while creating the user."}, 401

		g.x_new_token = json_response["token"]
		return {"message": "success", "id": user.id}, response.status_code

@ns.route("/login")
class UserLogin(Resource):
	@ns.expect(user_login_model)
	def patch(self):
		try:
			user_login_schema.load(request.json)
		except ValidationError as err:
			return {"message": err.messages}, 400

		try:
			response = requests.post(
				"http://auth:5055/login",
				json=request.json,
				headers=request.headers,
				timeout=5
			)
		except requests.exceptions.ConnectionError as e:
			print(f"Unable to communicate with the auth service for login ({e})", flush=True)
			return {"message": "Service currently unavailable."}, 503
		except Exception as e:
			print(f"WARNING: unhandled error happened in the login entrypoint ({e})", flush=True)
			return {"message": "Failed to log the user."}, 401


		json_response = response.json()
		if response.status_code != 201:
			return json_response, response.status_code

		user = User.query.filter_by(user_id=json_response["id"]).first()

		if not user:
			return {"message": "User data not found"}, 404

		update_payload = {"is_active": True, "updated_at": datetime.now(timezone.utc)}
		update_data = user_update_schema.load(update_payload)

		for k, v in update_data.items():
			setattr(user, k, v)

		db.session.commit()
		g.x_new_token = json_response["token"]

		return {"message": "success", "id": user.id}, response.status_code
