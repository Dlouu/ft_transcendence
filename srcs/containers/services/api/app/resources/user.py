from flask_restx import Namespace, Resource, fields
from flask import request
from app.models.user import User
from app.extensions import db
from app.schemas.user import user_login_schema, user_schema, user_update_schema
from marshmallow import ValidationError
from datetime import datetime, timezone
import requests

ns = Namespace("users", description="User operations")

# @ns.route("/")
# class UserList(Resource):
# 	@ns.marshal_list_with(user_model)
# 	def	get(self):
# 		return User.query.all(), 200

# 	@ns.expect(user_model)
# 	@ns.marshal_with(user_model, code=201)
# 	def	post(self):
# 		user = None
# 		try:
# 			user = user_schema.load(request.json)
# 		except ValidationError as err:
# 			return {"message": err.messages}, 400
# 		db.session.add(user)
# 		db.session.commit()
# 		return user, 201

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

		response = requests.post(
			"http://auth:5001/registration",
			json=request.json,
			timeout=5
		)

		json_response = response.json()
		print(json_response, json_response["id"], flush=True)
		if (response.status_code == 201):
			user_payload = {"username": auth_data["username"], "user_id": json_response["id"]}
			user = user_schema.load(user_payload)
			db.session.add(user)
			db.session.commit()

		return json_response, response.status_code

@ns.route("/login")
class UserLogin(Resource):
	@ns.expect(user_login_model)
	def patch(self):
		try:
			user_login_schema.load(request.json)
		except ValidationError as err:
			return {"message": err.messages}, 400

		response = requests.post(
			"http://auth:5001/login",
			json=request.json,
			timeout=5
		)

		json_response = response.json()
		if response.status_code == 201:
			user = User.query.filter_by(user_id=json_response["id"]).first()

			if not user:
				return {"message": "User data not found"}, 404

			update_payload = {"is_active": True, "updated_at": datetime.now(timezone.utc)}
			update_data = user_update_schema.load(update_payload)

			for k, v in update_data.items():
				setattr(user, k, v)

			db.session.commit()

		return json_response, response.status_code
