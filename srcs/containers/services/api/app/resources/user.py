from flask_restx import Namespace, Resource, fields
from flask import request
from app.models.user import User
from app.extensions import db
from app.schemas.user import user_login_schema, user_schema, user_update_schema
from app.resources.jwt_storage import add_token, delete_token
from marshmallow import ValidationError
from datetime import datetime, timezone
import requests
import jwt

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
			headers=request.headers,
			timeout=5
		)

		try:
			json_response = response.json()
		except requests.exceptions.JSONDecodeError as e:
			return {}, 500

		if (response.status_code == 201):
			try:
				user_payload = {"username": auth_data["username"], "user_id": json_response["id"]}
				user = user_schema.load(user_payload)
				db.session.add(user)
				db.session.commit()
			except Exception as e:
				print(e, flush=True)
				return {"message": "Error while initializing user data."}, 500
		else:
			return {"message": "Error while creating the user."}, 500

		add_token(json_response["encoded_payload"], json_response["jwt"])

		return {"message": "success", "id": user.id, "access_token": json_response["encoded_payload"]}, response.status_code

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
			headers=request.headers,
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

		return {}, response.status_code

test_model = ns.model("Test", {
	"haha": fields.String()
})

@ns.route("/test")
class Test(Resource):
	@ns.expect(test_model)
	def post(self):
		dct = dict(request.headers)
		for k, v in dct.items():
			print(k, " --- ", v, flush=True)
		print(request.remote_addr, flush=True)
		print(request.remote_user, flush=True)
		return {}, 200

jwt_test = ns.model("JWTTest", {
	"jwt": fields.String()
})

@ns.route("/test_jwt")
class TestJWT(Resource):
	@ns.expect(jwt_test)
	@ns.doc(security="BearerAuth")
	@ns.jwt_required()
	def post(self):
		auth_header = request.headers.get("Authorization")
		print(auth_header, flush=True)

		if not auth_header or not auth_header.startswith("Bearer "):
			return {"message": "Missing or invalid token"}, 401

		token = auth_header.split(" ", 1)[1]

		# print(cache_token[token], flush=True)
		from cryptography.hazmat.primitives.asymmetric import rsa
		private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
		encoded = jwt.encode({}, private_key, algorithm="RS256")

		private_key2 = rsa.generate_private_key(public_exponent=65537, key_size=2048)
		print(jwt.decode(encoded, private_key2.public_key(), algorithms="RS256"), flush=True)

		# jwt.exceptions.ExpiredSignatureError: Signature has expired
		# jwt.exceptions.DecodeError: Not enough segments
		# jwt.exceptions.InvalidSignatureError: Signature verification failed
		return {"message": "success"}, 200

