from flask_restx import Namespace, Resource, fields
from flask import request, g
from app.models.user import User
from app.extensions import db
from app.schemas.user import user_registration_schema, user_login_schema, user_schema
from app.services import session_service as st
from marshmallow import ValidationError
from datetime import datetime, timezone
import requests

ns = Namespace("Authentification", description="Authentification endpoints")

user_registration_model = ns.model("UserRegistration", {
	"email": fields.String(required=True),
	"username": fields.String(required=True),
	"password": fields.String(required=True),
})

@ns.route("/registration")
class UserRegistration(Resource):
	@ns.expect(user_registration_model)
	def post(self):
		"""
		Prepare the communication with the authentification service to create a new user.

		API:
			Method: POST
			Endpoint: /users/registration
			Token: no

		Response:
			201: User created.
			400: The request body isn't valid.
			401: Something wrong happened in the auth service during the creation of the user.
			503: Unable to communicate witht the auth service.
		"""
		auth_data = None
		try:
			auth_data = user_registration_schema.load(request.json)
		except ValidationError as err:
			return {"message": "One or more fields are missing"}, 400

		try:
			response = requests.post(
				"http://auth:5055/registration",
				json=request.json,
				headers=request.headers,
				timeout=5
			)

			json_response = response.json()
		except requests.exceptions.JSONDecodeError as e:
			return {"message": "Something wrong happened while creating the user, contact an admin if the problem persist."}, 401
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


user_login_model = ns.model("UserLogin", {
	"login_email": fields.String(required=True),
	"password": fields.String(required=True),
})

@ns.route("/login")
class UserLogin(Resource):
	@ns.expect(user_login_model)
	def patch(self):
		"""
		Prepare the communication with the authentification service to login the user.

		API:
			Method: PATCH
			Endpoint: /users/login
			Token: no

		Response:
			201: User can login, a token session is added to the response header.
			400: The request body isn't valid.
			401: Something wrong happened in the auth service or during users metadata initializaion.
			502: The auth service' response is invalid.
			503: Unable to communicate witht the auth service.
		"""
		try:
			auth_data = user_login_schema.load(request.json)
		except ValidationError as err:
			return {"message": "The body format isn't valid."}, 400

		try:
			response = requests.post(
				"http://auth:5055/login",
				json=request.json,
				headers=request.headers,
				timeout=5
			)
		except requests.exceptions.ConnectionError as e:
			print(f"{request.path}: Unable to communicate with the auth service ({e})", flush=True)
			return {"message": "Service currently unavailable."}, 503
		except Exception as e:
			print(f"{request.path}: WARNING: unhandled error happened, fix this as soon as possible ({e})", flush=True)
			return {"message": "Failed to log the user."}, 401

		try:
			json_response = response.json()
		except requests.exceptions.JSONDecodeError as e:
			print(f"{request.path}: Something went wrong while decoding the response to json, the auth service may have encountered an error and crashed.", flush=True)
			return {"message": f"Something wrong when trying to log the user."}, 400

		if response.status_code != 200:
			return json_response, response.status_code

		user = User.query.filter_by(user_id=json_response["id"]).first()

		if not user:
			try:
				user_payload = {"username": auth_data["username"], "user_id": json_response["id"]}
				user = user_schema.load(user_payload)
				db.session.add(user)
				db.session.commit()
			except Exception as e:
				print(f"{request.path}: something went wrong while trying to initialize the user in the database. ({e})", flush=True)
				return {"message": "The user exist but something went wrong while initializing his metadata. If the problem persist contact an admin."}, 401

		user.is_active = True
		user.updated_at = datetime.now(timezone.utc)

		db.session.commit()
		g.x_new_token = json_response["token"]

		return {"message": "success", "id": user.id}, 200
