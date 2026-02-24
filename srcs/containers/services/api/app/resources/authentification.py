from flask_restx import Namespace, Resource, fields
from marshmallow import ValidationError
from datetime import datetime, timezone
from flask import request, g, Request
import os

from app.schemas.user import user_registration_schema, user_login_schema, user_schema
from app.services import request_service as rs
from app.services import me_service as ms
from app.services import session_service as ss
from app.utils.logger import logger
from app.models.user import User
from app.extensions import db

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
			Endpoint: /auth/registration
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
			logger.warning("Request validation error.", extra=logger.extra(request=request))
			return {"message": "One or more fields are missing"}, 400

		response = rs.make_request("/auth/registration", "POST")
		json_response = response.json()

		if (response.status_code != 201):
			logger.warning("server refused.", extra=logger.extra(request=request, response=response, target_service="auth"))
			return json_response, response.status_code

		try:
			user_payload = {
				"username": auth_data["username"],
				"user_id": json_response["id"],
				"profile_picture_url": os.getenv("DEFAULT_IMG_PATH")+"/"+os.getenv("DEFAULT_PROFILE_PICTURE", "")}
			user = user_schema.load(user_payload)
			db.session.add(user)
			db.session.commit()
		except Exception as e:
			logger.critical(f"Unhandled error happened: {e}", extra=logger.extra(request=request))
			return {"message": "Error while creating the user."}, 401

		g.x_new_token = json_response["token"]

		logger.info("Registration successful.", extra=logger.extra(request=request))
		return ms.me(json_response["id"])


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
			Endpoint: /auth/login
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
			logger.warning("Request validation error.", extra=logger.extra(request=request))
			return {"message": "The body format isn't valid."}, 400

		response = rs.make_request("/auth/login", "POST")
		json_response = response.json()

		if response.status_code != 200:
			logger.warning("server refused.", extra=logger.extra(request=request, response=response, target_service="auth"))
			return json_response, response.status_code

		user = User.query.filter_by(user_id=json_response["id"]).first()

		if not user:
			try:
				user_payload = {"username": auth_data["username"], "user_id": json_response["id"]}
				user = user_schema.load(user_payload)
				db.session.add(user)
				db.session.commit()
			except Exception as e:
				logger.critical(f"Unhandled error happened: {e}", extra=logger.extra(request=request))
				return {"message": "The user exist but something went wrong while initializing his metadata. If the problem persist contact an admin."}, 401

		user.is_active = True
		user.updated_at = datetime.now(timezone.utc)

		db.session.commit()
		g.x_new_token = json_response["token"]

		logger.info("Login successful.", extra=logger.extra(request=request))
		return ms.me(json_response["id"])

@ns.route("/logout")
class Logout(Resource):
	def get(self):
		if hasattr(g, "token") and ss.does_session_token_exist(g.token):
			ss.delete_session_token(g.token)
		g.x_new_token = "none"
		return {"message": "success"}, 200
