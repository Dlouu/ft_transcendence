from flask_restx import Namespace, Resource, fields
from flask import request
# from app.models.user import User
from app.extensions import db
from app.schemas.user import user_login_schema
from marshmallow import ValidationError
import requests

ns = Namespace("users", description="User operations")

# user_model = ns.model("User", {
# 	"email": fields.String(required=True),
# 	"username": fields.String(required=False)
# })

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


user_login_model = ns.model("UserLogin", {
	"email": fields.String(required=True),
	"username": fields.String(required=True),
	"password": fields.String(required=True),
})

@ns.route("/registration")
class UserRegistration(Resource):
	@ns.expect(user_login_model)
	@ns.marshal_with(user_login_model, code=201)
	def post(self):
		try:
			user_login_schema.load(request.json)
		except ValidationError as err:
			return {"message": err.messages}, 400

		response = requests.post(
			"http://auth:5001/registration",
			json=request.json,
			timeout=5
		)
		rep = response.json
		print(response.text, flush=True)
		return response.json, response.status_code

@ns.route("/login")
class UserLogin(Resource):
	@ns.expect(user_login_model)
	@ns.marshal_list_with(user_login_model, code=201)
	def post(self):
		try:
			user_login_schema.load(request.json)
		except ValidationError as err:
			return {"message": err.messages}, 400

		response = requests.post(
			"http://auth:5001/login",
			json=request.json,
			timeout=5
		)
		return response.json, response.status_code
