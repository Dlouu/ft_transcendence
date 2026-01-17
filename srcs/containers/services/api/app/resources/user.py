from flask_restx import Namespace, Resource, fields
from flask import request
from app.models.user import User
from app.extensions import db
from app.schemas.user import user_schema, users_schema

ns = Namespace("users", description="User operations")

user_model = ns.model("User", {
	"id": fields.Integer(readOnly=True),
	"email": fields.String(required=True)
})

@ns.route("/")
class UserList(Resource):
	@ns.marshal_list_with(user_model)
	def	get(self):
		"""List all users"""
		return User.query.all()

	@ns.expect(user_model)
	@ns.marshal_with(user_model, code=201)
	def	post(self):
		"""Create a user"""
		data = request.json
		user = User(email=data["email"])
		db.session.add(user)
		db.session.commit()
		return user, 201
